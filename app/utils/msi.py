from datetime import date
from decimal import Decimal


def monthly_msi_payment(amount: Decimal, msi_months: int) -> Decimal:
    return amount / msi_months


def is_msi_active_in_month(msi_start_date: date, msi_months: int, target_year: int, target_month: int) -> bool:
    start = msi_start_date
    for i in range(msi_months):
        month = ((start.month - 1 + i) % 12) + 1
        year = start.year + ((start.month - 1 + i) // 12)
        if year == target_year and month == target_month:
            return True
    return False


def suggested_payment(contado_total: Decimal, active_msi_payments: list[Decimal]) -> Decimal:
    return contado_total + sum(active_msi_payments)
