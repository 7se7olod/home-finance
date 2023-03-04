export class DateFormatter {
    static weekDate = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7));
    static monthDate = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
    static yearDate = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()));
    static allDate = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear() - 300, new Date().getMonth(), new Date().getDate()));

    static YYYY_MM_DD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`;
    }

    static DD_MM_YYYY(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0')
        return `${day}.${month}.${year}`;
    }
}
