<?php

namespace App\Enums;

use Carbon\CarbonInterface;

enum RecurrenceFrequency: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function nextOccurrence(CarbonInterface $date): CarbonInterface
    {
        return match ($this) {
            self::Daily => $date->copy()->addDay(),
            self::Weekly => $date->copy()->addWeek(),
            self::Monthly => $date->copy()->addMonthNoOverflow(),
            self::Yearly => $date->copy()->addYearNoOverflow(),
        };
    }
}
