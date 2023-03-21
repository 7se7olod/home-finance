export class DateFormatter {
    public static weekDate: DateFormatter = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7));
    public static monthDate: DateFormatter = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
    public static yearDate: DateFormatter = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()));
    public static allDate: DateFormatter = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear() - 300, new Date().getMonth(), new Date().getDate()));

    public static YYYY_MM_DD(date: Date): string {
        const year: string = date.getFullYear().toString();
        const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
        const day: string = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`;
    }

    public static DD_MM_YYYY(date: Date): string {
        const year: string = date.getFullYear().toString();
        const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
        const day: string = date.getDate().toString().padStart(2, '0')
        return `${day}.${month}.${year}`;
    }
}
