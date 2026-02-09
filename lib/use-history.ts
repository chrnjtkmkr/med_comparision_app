"use client";

import { useState, useEffect } from "react";
import { getHistoryAction } from "@/app/actions";

export type HistoryItem = {
    id: string;
    type: string;
    title: string;
    date: string;
    status: string;
    data: any;
    imageLink?: string;
};

export function useHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        const response = await getHistoryAction();
        if (response.success && response.data) {
            setHistory(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return { history, loading, refresh: fetchHistory };
}
