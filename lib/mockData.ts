// lib/mockData.ts — Mock data จาก HTML prototype เดิม

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface MockFile {
    id: number;
    name: string;
    type: FileType;
    ext: string;
    tags: string[];
    date: string;
}

export const MOCK_FILES: MockFile[] = [
    { id: 1, name: 'sunset-lake-trip.jpg', type: 'image', ext: 'JPG', tags: ['ธรรมชาติ', 'ทริป2024'], date: '2026-07-28' },
    { id: 2, name: 'team-offsite-group.png', type: 'image', ext: 'PNG', tags: ['ทีมงาน', 'กิจกรรม'], date: '2026-07-26' },
    { id: 3, name: 'product-demo-final.mp4', type: 'video', ext: 'MP4', tags: ['โปรดักต์', 'ดีโม'], date: '2026-07-24' },
    { id: 4, name: 'interview-recording.mp3', type: 'audio', ext: 'MP3', tags: ['สัมภาษณ์', 'เสียง'], date: '2026-07-21' },
    { id: 5, name: 'quarterly-report-q2.pdf', type: 'document', ext: 'PDF', tags: ['รายงาน', 'การเงิน'], date: '2026-07-19' },
    { id: 6, name: 'brand-guideline-v3.png', type: 'image', ext: 'PNG', tags: ['แบรนด์', 'ดีไซน์'], date: '2026-07-15' },
    { id: 7, name: 'onboarding-checklist.xlsx', type: 'document', ext: 'XLSX', tags: ['HR', 'เอกสาร'], date: '2026-07-12' },
    { id: 8, name: 'mountain-hike-cover.jpg', type: 'image', ext: 'JPG', tags: ['ธรรมชาติ', 'ทริป2024'], date: '2026-07-08' },
    { id: 9, name: 'archive-backup.zip', type: 'other', ext: 'ZIP', tags: ['สำรองข้อมูล'], date: '2026-07-03' },
    { id: 10, name: 'podcast-ep12-raw.wav', type: 'audio', ext: 'WAV', tags: ['เสียง', 'พอดแคสต์'], date: '2026-06-29' },
];

export const TYPE_COLORS: Record<FileType, { color: string; soft: string; emoji: string }> = {
    image: { color: '#3B6FA6', soft: '#E2EBF4', emoji: '🖼️' },
    video: { color: '#7A4FB0', soft: '#EAE2F5', emoji: '🎬' },
    audio: { color: '#C97C1F', soft: '#F6E9D6', emoji: '🎵' },
    document: { color: '#146356', soft: '#DCEDE8', emoji: '📄' },
    other: { color: '#5B6B67', soft: '#E7EAE9', emoji: '📦' },
};

export const PRESET_COLORS = [
    '#d9d9d9', '#ff4d4f', '#ff9c6e', '#ffc53d', '#73d13d',
    '#36cfc9', '#4096ff', '#9254de', '#f759ab', '#000000',
];

export const MOCK_MANAGE_FILES = [
    { id: 1, name: 'Prototype_V1.fig', icon: '🎨' },
    { id: 2, name: 'Database_Diagram.png', icon: '🖼️' },
    { id: 3, name: 'Project_Proposal.pdf', icon: '📄' },
    { id: 4, name: 'User_Flow.jpg', icon: '🖼️' },
    { id: 5, name: 'Presentation.pptx', icon: '📊' },
];

// Design system colors
export const COLORS = {
    canvas: '#F3F5F4',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFBFA',
    ink: '#16211F',
    muted: '#5B6B67',
    line: '#DDE3E0',
    accent: '#146356',
    accentSoft: '#DCEDE8',
    danger: '#B23A2E',
    dangerSoft: '#F7E3E0',
    ok: '#1F7A4D',
    okSoft: '#DDEFE3',
};
