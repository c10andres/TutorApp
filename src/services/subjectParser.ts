export interface ScheduleBlock {
    day: string;
    time: string;
    building: string;
    room: string;
    sede: string;
}

export interface UniversitySubject {
    code: string;
    name: string;
    faculty: string;
    project: string;
    group: string;
    professor: string;
    schedule: string; // Combined schedule string for display
    location: string; // Combined location string for display
    scheduleBlocks: ScheduleBlock[]; // Array of all schedule blocks
}

export interface RawSubjectRow {
    "Cod.": string;
    "Espacio Academico": string;
    "Dia": string;
    "Hora": string;
    "Sede": string;
    "Edificio": string;
    "Salon": string;
    "Docente": string;
    "Grupo": string;
    "Proyecto curricular": string;
    "Facultad": string;
}

export const parseSubjectsCsv = (csvContent: string): UniversitySubject[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(';');

    // Map to group subjects by code + group
    const subjectMap = new Map<string, UniversitySubject>();

    // Helper function to sanitize strings and remove potentially dangerous characters
    const sanitize = (str: string): string => {
        return str
            .replace(/</g, '')
            .replace(/>/g, '')
            .replace(/"/g, '')
            .replace(/'/g, '')
            .replace(/`/g, '')
            .replace(/\\/g, '')
            .trim();
    };

    // Start from line 1 to skip headers
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(';');

        // Ensure we have enough values
        if (values.length < 11) continue;

        const code = sanitize(values[0]);
        const name = sanitize(values[1]);
        const day = sanitize(values[2]);
        const time = sanitize(values[3]);
        const sede = sanitize(values[4]);
        const building = sanitize(values[5]);
        const room = sanitize(values[6]);
        const professor = sanitize(values[7]);
        const group = sanitize(values[8]);
        const project = sanitize(values[9]);
        const faculty = sanitize(values[10]);

        // Skip if name or code is empty
        if (!name || !code) continue;

        // Create unique key for this subject (code + group + professor + project)
        // This ensures that if the same group number is used for different projects/professors, they are kept separate
        const key = `${code}-${group}-${professor}-${project}`;

        // Get or create subject entry
        if (!subjectMap.has(key)) {
            subjectMap.set(key, {
                code,
                name,
                faculty,
                project,
                group,
                professor,
                schedule: '',
                location: '',
                scheduleBlocks: []
            });
        }

        const subject = subjectMap.get(key)!;

        // Add schedule block
        if (day && time) {
            subject.scheduleBlocks.push({
                day,
                time,
                building,
                room,
                sede
            });
        }
    }

    // Convert map to array and build combined schedule/location strings
    const subjects: UniversitySubject[] = [];

    for (const subject of subjectMap.values()) {
        // Sort blocks by day and time to ensure correct merging order
        subject.scheduleBlocks.sort((a, b) => {
            if (a.day !== b.day) return a.day.localeCompare(b.day);
            return a.time.localeCompare(b.time);
        });

        // Merge consecutive blocks
        const mergedBlocks: ScheduleBlock[] = [];
        if (subject.scheduleBlocks.length > 0) {
            let currentBlock = subject.scheduleBlocks[0];

            for (let i = 1; i < subject.scheduleBlocks.length; i++) {
                const nextBlock = subject.scheduleBlocks[i];

                // Check time continuity
                // Format is "HH:MM - HH:MM"
                const currentTimes = currentBlock.time.split(' - ');
                const nextTimes = nextBlock.time.split(' - ');

                const isConsecutive = currentTimes[1] === nextTimes[0];
                const isSameDay = currentBlock.day === nextBlock.day;
                const isSameLocation =
                    currentBlock.sede === nextBlock.sede &&
                    currentBlock.building === nextBlock.building &&
                    currentBlock.room === nextBlock.room;

                if (isSameDay && isSameLocation && isConsecutive) {
                    // Merge: update end time of current block
                    currentBlock.time = `${currentTimes[0]} - ${nextTimes[1]}`;
                } else {
                    // Push distinct block and move pointer
                    mergedBlocks.push(currentBlock);
                    currentBlock = nextBlock;
                }
            }
            mergedBlocks.push(currentBlock);
        }
        subject.scheduleBlocks = mergedBlocks;

        // Build combined schedule string
        const scheduleStrings = subject.scheduleBlocks.map(block =>
            `${block.day} ${block.time}`
        );
        subject.schedule = scheduleStrings.join(', ');

        // Build combined location string (use first block's location)
        if (subject.scheduleBlocks.length > 0) {
            const firstBlock = subject.scheduleBlocks[0];
            subject.location = firstBlock.building && firstBlock.room
                ? `${firstBlock.building} - ${firstBlock.room}`
                : firstBlock.sede;
        }

        subjects.push(subject);
    }

    return subjects;
};
