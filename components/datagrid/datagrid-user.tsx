"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { inviteUserSchema } from "@/validation/company-schema";
import { inviteUserAction, removeUserAction, changeUserRoleAction } from "@/action/company-actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
    UserPlus,
    MoreHorizontal,
    Crown,
    Shield,
    User,
    Mail,
    Calendar,
    Trash2,
    Edit3,
    AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'owner' | 'admin' | 'user';
    createdAt: Date;
}

interface DatagridUserProps {
    members: TeamMember[];
    userRole: 'owner' | 'admin' | 'user';
    currentUserId: string;
    subscription: {
        plan: string;
        maxUsers: number;
        currentUsers: number;
        features: string[];
    };
}

export default function DatagridUser({ members, userRole, currentUserId, subscription }: DatagridUserProps) {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const router = useRouter();
    const isOwner = userRole === 'owner';

    // Vérifier si on peut ajouter de nouveaux utilisateurs
    const canInviteUsers = subscription.maxUsers === -1 ||
        subscription.currentUsers < subscription.maxUsers;

    // Calculer le pourcentage d'utilisation des utilisateurs
    const userUsagePercentage = subscription.maxUsers === -1 ? 0 :
        (subscription.currentUsers / subscription.maxUsers) * 100;

    // Formulaire pour inviter un utilisateur
    const inviteForm = useForm({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "user" as const,
        },
    });

    // Formulaire pour changer le rôle
    const roleForm = useForm({
        resolver: zodResolver(inviteUserSchema.pick({ role: true })),
        defaultValues: {
            role: "user" as const,
        },
    });

    // Actions
    const { execute: inviteUser, isPending: isInvitingUser } = useAction(inviteUserAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Utilisateur invité avec succès");
            inviteForm.reset();
            setShowInviteDialog(false);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de l'invitation de l'utilisateur");
        },
    });

    const { execute: removeUser, isPending: isRemovingUser } = useAction(removeUserAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Utilisateur supprimé avec succès");
            setShowDeleteDialog(false);
            setSelectedMember(null);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors de la suppression de l'utilisateur");
        },
    });

    const { execute: changeRole, isPending: isChangingRole } = useAction(changeUserRoleAction, {
        onSuccess: (data) => {
            toast.success(data.data?.message || "Rôle modifié avec succès");
            setShowRoleDialog(false);
            setSelectedMember(null);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error.serverError?.message || "Erreur lors du changement de rôle");
        },
    });

    const onInviteSubmit = (data: any) => {
        inviteUser(data);
    };

    const onRoleSubmit = (data: any) => {
        if (selectedMember) {
            changeRole({
                userId: selectedMember.id,
                role: data.role
            });
        }
    };

    const handleChangeRole = (member: TeamMember) => {
        setSelectedMember(member);
        roleForm.reset({ role: member.role === 'owner' ? 'admin' : member.role });
        setShowRoleDialog(true);
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'owner':
                return 'Propriétaire';
            case 'admin':
                return 'Administrateur';
            case 'user':
                return 'Utilisateur';
            default:
                return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'user':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="h-4 w-4" />;
            case 'admin':
                return <Shield className="h-4 w-4" />;
            case 'user':
                return <User className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };


    const handleDeleteMember = (member: TeamMember) => {
        setSelectedMember(member);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (selectedMember) {
            removeUser({ userId: selectedMember.id });
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec bouton d'invitation */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Équipe</h2>
                    <p className="text-muted-foreground">
                        {members.length} membre{members.length > 1 ? 's' : ''} dans l&apos;équipe
                        {subscription.maxUsers !== -1 && (
                            <span className="ml-2">
                                • {subscription.currentUsers}/{subscription.maxUsers} utilisateurs
                            </span>
                        )}
                    </p>
                </div>
                {isOwner && (
                    <div className="flex items-center gap-2">
                        {!canInviteUsers ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button disabled variant="outline" className="gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            Inviter un membre
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Limite d&apos;utilisateurs atteinte pour le plan {subscription.plan}</p>
                                        <p>Maximum: {subscription.maxUsers} utilisateurs</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Inviter un membre
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Inviter un nouveau membre</DialogTitle>
                                        <DialogDescription>
                                            Ajoutez un nouveau membre à votre équipe
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...inviteForm}>
                                        <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                                            <FormField
                                                control={inviteForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Prénom et nom</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Jean Dupont" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={inviteForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="email" placeholder="jean@exemple.com" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={inviteForm.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rôle</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un rôle" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="user">Utilisateur</SelectItem>
                                                                <SelectItem value="admin">Administrateur</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex gap-2 justify-end pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowInviteDialog(false)}
                                                >
                                                    Annuler
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isInvitingUser}
                                                >
                                                    {isInvitingUser ? "Invitation..." : "Inviter"}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )}
            </div>

            {/* Alerte de limite d'utilisateurs */}
            {isOwner && userUsagePercentage >= 80 && (
                <Alert className={userUsagePercentage >= 100 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                    <AlertTriangle className={`h-4 w-4 ${userUsagePercentage >= 100 ? "text-red-600" : "text-yellow-600"}`} />
                    <AlertDescription className={userUsagePercentage >= 100 ? "text-red-800" : "text-yellow-800"}>
                        {userUsagePercentage >= 100 ? (
                            <span>
                                <strong>Limite atteinte !</strong> Vous avez atteint la limite de {subscription.maxUsers} utilisateurs
                                pour le plan {subscription.plan}.
                            </span>
                        ) : (
                            <span>
                                <strong>Attention !</strong> Vous utilisez {subscription.currentUsers}/{subscription.maxUsers} utilisateurs
                                de votre plan {subscription.plan}.
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Tableau des membres */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Membre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Date d&apos;ajout</TableHead>
                            {isOwner && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isOwner ? 5 : 4} className="text-center py-8 text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">Aucun membre dans l&apos;équipe</p>
                                    <p className="text-xs mt-1">Commencez par inviter votre premier membre</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                {member.image ? (
                                                    <AvatarImage src={member.image} alt={`Avatar de ${member.name}`} />
                                                ) : null}
                                                <AvatarFallback className="text-sm font-medium">
                                                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <span className="text-muted-foreground text-xs">
                                                    {member.id === currentUserId ? '(Vous)' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{member.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${getRoleColor(member.role)} text-xs gap-1`}>
                                            {getRoleIcon(member.role)}
                                            {getRoleLabel(member.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(new Date(member.createdAt))}</span>
                                        </div>
                                    </TableCell>
                                    {isOwner && (
                                        <TableCell className="text-right">
                                            {member.role !== 'owner' && member.id !== currentUserId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleChangeRole(member)}>
                                                            <Edit3 className="h-4 w-4 mr-2" />
                                                            Changer le rôle
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteMember(member)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer {selectedMember?.name} de l&apos;équipe ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isRemovingUser}
                        >
                            {isRemovingUser ? "Suppression..." : "Supprimer"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de changement de rôle */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changer le rôle de {selectedMember?.name}</DialogTitle>
                        <DialogDescription>
                            Sélectionnez le nouveau rôle pour ce membre de l&apos;équipe.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...roleForm}>
                        <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                            <FormField
                                control={roleForm.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouveau rôle</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un rôle" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="user">Utilisateur</SelectItem>
                                                <SelectItem value="admin">Administrateur</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isChangingRole}
                                >
                                    {isChangingRole ? "Modification..." : "Modifier"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
