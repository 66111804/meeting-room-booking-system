export interface IMeetingRoomDashboard
{
    id: number;
    name: string;
}

export interface IMeetingDashboard
{
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: "confirmed" | "pending" | "cancelled" | undefined;
    MeetingRoom: IMeetingRoomDashboard;
}

export interface IMeetingDashboardResponse
{
    meetings: IMeetingDashboard[];
    total: number;
    totalPages: number;
    currentPage: number;
}