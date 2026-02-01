"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, User, Minimize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/logo';

interface Message {
    role: 'user' | 'model';
    parts: string;
}

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);
    const toggleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(!isMinimized);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', parts: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Format history for Gemini API (if needed)
            // const history = messages.map(m => ({
            //   role: m.role,
            //   parts: [{ text: m.parts }]
            // }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.parts,
                    // Sending limited history to save tokens/complexity for now
                    history: messages.slice(-5).map(m => ({
                        role: m.role,
                        parts: [{ text: m.parts }]
                    }))
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();
            const botMessage: Message = { role: 'model', parts: data.reply };
            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [...prev, { role: 'model', parts: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-105 transition-transform bg-primary text-primary-foreground"
            >
                <MessageSquare className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out font-body",
            isMinimized ? "w-72 h-14" : "w-[90vw] sm:w-[400px] h-[500px]"
        )}>
            <Card className="h-full border-primary/20 shadow-xl flex flex-col overflow-hidden">
                <CardHeader
                    className="p-3 bg-primary text-primary-foreground cursor-pointer flex flex-row items-center justify-between"
                    onClick={() => !isMinimized && setIsMinimized(true)}
                >
                    <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); if (isMinimized) setIsMinimized(false); }}>
                        <div className="bg-white/20 p-1.5 rounded-full">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium">Yuktah Assistant</CardTitle>
                            {!isMinimized && <p className="text-[10px] opacity-80">AI-Powered Helper</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-white/20" onClick={toggleMinimize}>
                            <Minimize2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-white/20" onClick={(e) => { e.stopPropagation(); toggleChat(); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <>
                        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30 relative">
                            <div className="absolute inset-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                {messages.length === 0 && (
                                    <div className="text-center p-6 text-muted-foreground mt-10">
                                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="font-medium mb-1">Hi there! 👋</p>
                                        <p className="text-sm">I'm Yuktah AI. Ask me about your medicines, reports, or general health tips!</p>
                                    </div>
                                )}

                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                                            m.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-white border text-foreground rounded-bl-none shadow-sm"
                                        )}>
                                            {m.parts}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start w-full">
                                        <div className="bg-white border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="p-3 bg-background border-t">
                            <form
                                className="flex w-full gap-2"
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            >
                                <Input
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="rounded-full h-10 w-10 shrink-0"
                                    disabled={!input.trim() || isLoading}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}
