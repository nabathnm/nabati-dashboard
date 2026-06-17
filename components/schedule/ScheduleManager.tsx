import { useState } from "react";
import { useUpsertRoutineProfile } from "@/hooks/use-routines";
import type { CollegeClass, RoutineUserProfile } from "@/types/routine";

type ClassSchedule = Record<string, CollegeClass[]>;

interface ModalData {
    day: string;
    cls: CollegeClass;
}

export function useScheduleManager(profile: RoutineUserProfile | undefined) {
    const { mutateAsync: upsertProfile, isPending } = useUpsertRoutineProfile();

    const schedule: ClassSchedule = profile?.college_schedule || {};

    const persistSchedule = (newSchedule: ClassSchedule) => {
        if (!profile) return Promise.resolve();
        return upsertProfile({
            goals: profile.goals,
            sleep_start: profile.sleep_start || undefined,
            sleep_end: profile.sleep_end || undefined,
            energy_preference: profile.energy_preference || undefined,
            organization_schedule: profile.organization_schedule,
            college_schedule: newSchedule,
        });
    };

    const saveClass = async (
        day: string,
        newClass: CollegeClass,
        modalData: ModalData | null
    ) => {
        if (!profile) return;

        const newSchedule = { ...schedule };

        // If editing an existing class that moved to a different day, remove the old entry
        if (modalData && modalData.day !== day) {
            newSchedule[modalData.day] = (newSchedule[modalData.day] || []).filter(
                (c) => c.id !== newClass.id
            );
        }

        const dayClasses = [...(newSchedule[day] || [])];
        const existingIdx = dayClasses.findIndex((c) => c.id === newClass.id);

        if (existingIdx >= 0) {
            dayClasses[existingIdx] = newClass;
        } else {
            dayClasses.push(newClass);
        }

        newSchedule[day] = dayClasses;

        await persistSchedule(newSchedule);
    };

    const deleteClass = async (day: string, classId: string) => {
        if (!profile) return;

        const newSchedule = { ...schedule };
        if (newSchedule[day]) {
            newSchedule[day] = newSchedule[day].filter((c) => c.id !== classId);
        }

        await persistSchedule(newSchedule);
    };

    return { schedule, saveClass, deleteClass, isSaving: isPending };
}

export function useClassModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [defaultDay, setDefaultDay] = useState("monday");
    const [defaultStartHour, setDefaultStartHour] = useState(8);

    const openForNewClass = () => {
        setModalData(null);
        setDefaultDay("monday");
        setDefaultStartHour(8);
        setIsOpen(true);
    };

    const openForEdit = (day: string, cls: CollegeClass) => {
        setModalData({ day, cls });
        setIsOpen(true);
    };

    const openForNewSlot = (day: string, hour: number) => {
        setModalData(null);
        setDefaultDay(day);
        setDefaultStartHour(hour);
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    return {
        isOpen,
        modalData,
        defaultDay,
        defaultStartHour,
        openForNewClass,
        openForEdit,
        openForNewSlot,
        close
    };
}