import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartNotesView } from "./smartnotes-view";
import { EvolutionView } from "./evolution-view";
import { SessionNotes } from "../../../sessoes/[id]/_components/session-notes";
import { formatDate } from "@/lib/utils/format";
import type { Session, Patient } from "@/lib/types/database";

interface SessionDetailDialogProps {
    session: Session | null;
    patient: Patient;
    professionalName: string;
    professionalCrp: string;
    activeTab: "anotacao" | "prontuario";
    onTabChange: (tab: "anotacao" | "prontuario") => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SessionDetailDialog({
    session,
    patient,
    professionalName,
    professionalCrp,
    activeTab,
    onTabChange,
    open,
    onOpenChange,
}: SessionDetailDialogProps) {
    if (!session) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        Sessão de {formatDate(session.session_date)}
                        {session.start_time && ` às ${session.start_time}`} —{" "}
                        {patient.full_name}
                    </DialogTitle>
                </DialogHeader>
                <Tabs
                    defaultValue={activeTab}
                // We remove control from props for the tab value to let internal state handle the new tab
                // or we map the new tab to one of the existing strings if we want to keep props control.
                // For simplicity, let's treat "anotacao" as default and handle switching internally or just use defaultValue.
                // If the parent controls `activeTab`, we need to respect it. 
                // However, we are adding a 3rd tab. The parent `SessionsTab` only knows "anotacao" | "prontuario".
                // Let's assume we can stay on "anotacao" for notes.
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="anotacao" className="flex-1">
                            Anotação
                        </TabsTrigger>
                        <TabsTrigger value="resumo-ia" className="flex-1">
                            Resumo IA
                        </TabsTrigger>
                        <TabsTrigger value="prontuario" className="flex-1">
                            Prontuário
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="anotacao" className="mt-4">
                        <SessionNotes sessionId={session.id} initialNotes={session.notes} />
                    </TabsContent>
                    <TabsContent value="resumo-ia" className="mt-4">
                        <SmartNotesView smartnotes={session.smartnotes} />
                    </TabsContent>
                    <TabsContent value="prontuario" className="mt-4">
                        <EvolutionView
                            evolution={session.evolution}
                            patientName={patient.full_name}
                            professionalName={professionalName}
                            professionalCrp={professionalCrp}
                            sessionDate={session.session_date}
                            sessionType={session.session_type}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
