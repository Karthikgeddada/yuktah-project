
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowLeft, Loader2, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FamilyMember {
    _id: string;
    name: string;
    relation: string;
    avatarUrl: string;
}

export default function FamilyMembersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [newName, setNewName] = useState("");
    const [newRelation, setNewRelation] = useState("");
    const [otherRelation, setOtherRelation] = useState("");

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/family');
            if (res.ok) {
                const result = await res.json();
                setMembers(result.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch family members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleAddMember = async () => {
        if (!newName || !newRelation) {
            toast({
                title: "Error",
                description: "Name and relation are required",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSaving(true);
            const res = await fetch('/api/family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    relation: newRelation,
                    otherRelation: newRelation === 'Other' ? otherRelation : ''
                }),
            });

            if (res.ok) {
                const result = await res.json();
                setMembers([result.data, ...members]);
                setIsDialogOpen(false);
                setNewName("");
                setNewRelation("");
                setOtherRelation("");
                toast({
                    title: "Success",
                    description: "Family member added successfully",
                });
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to add member");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:hidden -ml-4 -mt-4 mb-4 border-b">
                <header className="p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h2 className="font-semibold">Family Members</h2>
                </header>
            </div>

            <div className="flex justify-between items-center px-4 sm:px-0">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Family Members</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage medical profiles and caregiver access for your loved ones.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full shadow-lg hover:shadow-xl transition-all">
                            <UserPlus className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Family Member</DialogTitle>
                            <DialogDescription>
                                Create a new medical profile for your family member.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Emily Doe"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="relation" className="text-right">
                                    Relation
                                </Label>
                                <div className="col-span-3">
                                    <Select value={newRelation} onValueChange={setNewRelation}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Father">Father</SelectItem>
                                            <SelectItem value="Mother">Mother</SelectItem>
                                            <SelectItem value="Spouse">Spouse</SelectItem>
                                            <SelectItem value="Wife">Wife</SelectItem>
                                            <SelectItem value="Husband">Husband</SelectItem>
                                            <SelectItem value="Son">Son</SelectItem>
                                            <SelectItem value="Daughter">Daughter</SelectItem>
                                            <SelectItem value="Elder Brother">Elder Brother</SelectItem>
                                            <SelectItem value="Younger Brother">Younger Brother</SelectItem>
                                            <SelectItem value="Elder Sister">Elder Sister</SelectItem>
                                            <SelectItem value="Younger Sister">Younger Sister</SelectItem>
                                            <SelectItem value="Friend">Friend</SelectItem>
                                            <SelectItem value="Neighbor">Neighbor</SelectItem>
                                            <SelectItem value="Other">Other Relation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {newRelation === "Other" && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="otherRelation" className="text-right">
                                        Specify
                                    </Label>
                                    <Input
                                        id="otherRelation"
                                        value={otherRelation}
                                        onChange={(e) => setOtherRelation(e.target.value)}
                                        placeholder="e.g. Cousin"
                                        className="col-span-3"
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddMember} disabled={isSaving}>
                                {isSaving ? "Creating..." : "Create Profile"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                    <p className="text-muted-foreground mt-4">Loading family...</p>
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed">
                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
                        <UserPlus className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No family members yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto text-sm">
                        Start by adding a family member to manage their health records and medication.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add your first member
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                        <Link href={`/dashboard/family/${member._id}`} key={member._id}>
                            <Card className="hover:shadow-soft-lg transition-all duration-300 border-none bg-white shadow-soft group">
                                <CardContent className="pt-6 flex items-center gap-4">
                                    <Avatar className="h-20 w-20 ring-4 ring-transparent group-hover:ring-primary/10 transition-all">
                                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
                                        <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                            {member.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <h3 className="font-bold font-headline text-lg group-hover:text-primary transition-colors">{member.name}</h3>
                                        <p className="text-sm text-muted-foreground bg-gray-100 w-fit px-3 py-1 rounded-full font-medium mt-1">
                                            {member.relation}
                                        </p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <ArrowLeft className="h-4 w-4 rotate-180" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
