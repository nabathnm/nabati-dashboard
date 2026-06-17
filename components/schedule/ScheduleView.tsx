"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import ClassModal from "@/components/schedule/ClassModal";
import RoutineProfileModal from "@/components/routine/routine-profile-modal";
import { useRoutineProfile } from "@/hooks/use-routines";
import { BookOpen, Loader2, Settings } from "lucide-react";
import { useScheduleManager, useClassModal } from "@/components/schedule/ScheduleManager";

export default function SchedulePage() {
    const { data: profile, isLoading } = useRoutineProfile();
    const { schedule, saveClass, deleteClass, isSaving } = useScheduleManager(profile);
    const classModal = useClassModal();

    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const handleSaveClass = (day: string, newClass: import("@/types/routine").CollegeClass) =>
        saveClass(day, newClass, classModal.modalData);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Schedule"
                description="Manage your classes. AI will use this to optimize your daily routine."
            >
                <button
                    onClick={() => setProfileModalOpen(true)}
                    className="p-2.5 bg-white text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
                    title="Edit Goals & Preferences"
                >
                    <Settings className="w-4.5 h-4.5" />
                </button>
                <button
                    onClick={classModal.openForNewClass}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    Add Class
                </button>
            </PageHeader>

            {!profile ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                    <h3 className="text-lg font-bold text-slate-800">Profile Not Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Please visit the Routine page to setup your goals first.
                    </p>
                </div>
            ) : (
                <ScheduleGrid
                    schedule={schedule}
                    onClassClick={(day, cls) => classModal.openForEdit(day, cls)}
                    onEmptySlotClick={(day, hour) => classModal.openForNewSlot(day, hour)}
                />
            )}

            <ClassModal
                open={classModal.isOpen}
                onClose={classModal.close}
                onSave={handleSaveClass}
                onDelete={deleteClass}
                initialData={classModal.modalData}
                defaultDay={classModal.defaultDay}
                defaultStartHour={classModal.defaultStartHour}
            />

            <RoutineProfileModal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </div>
    );
}