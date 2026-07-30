export declare const DATE_PATTERNS: {
    "DD/MM/YYYY": {
        imPattern: string;
        imRangePattern: string;
        fnsPattern: string;
    };
    "MM/DD/YYYY": {
        imPattern: string;
        imRangePattern: string;
        fnsPattern: string;
    };
    "YYYY/MM/DD": {
        imPattern: string;
        imRangePattern: string;
        fnsPattern: string;
    };
};
/**
 * @description - creates calendar's year view years array with context of
 * datepicker's displayDate and current year
 * Fixes current year to the start of array
 */
export declare const createYearViewArray: (displayDate: Date, currentYear: number) => any[];
export declare const sanitizedNextMonth: (d: Date) => Date;
export declare const sanitizedPreviousMonth: (d: Date) => Date;
export declare const setTimeToNoon: (date: Date) => Date;
export declare const sortAscDates: (dates: Date[]) => Date[];
