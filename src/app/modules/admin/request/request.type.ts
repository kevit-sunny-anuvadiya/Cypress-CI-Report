export interface FirmDataInfo {
    class: string;
    name: string;
    requestCount: number;
}

export interface TaskDataInfo{
    customerOutstandingTask: Array<customerDetails>
    totalOutStandingTask: number;
}

export interface customerDetails {
            count: number;
            firms: {
                    firmName: string;
                    _id: string;
            };
            name: string;
            selectedFirm?: {
                firmName: string;
                _id: string;
            }
            _id: string[];
            type?: string;
}
