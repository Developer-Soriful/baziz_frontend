import { propertyService } from "./property.service";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export async function buildPortfolioContext(): Promise<string> {
  try {
    const [propertiesResponse, paymentsResponse, tasksResponse] = await Promise.all([
      propertyService.getAll().catch(() => []),
      apiClient.get(ENDPOINTS.RENT_PAYMENTS.LANDLORD).then((r) => r.data).catch(() => []),
      apiClient.get(ENDPOINTS.TASKS.BASE).then((r) => r.data.data?.tasks || r.data.data || r.data).catch(() => []),
    ]);

    const properties = Array.isArray(propertiesResponse) ? propertiesResponse : [];
    const payments = Array.isArray(paymentsResponse) ? paymentsResponse : [];
    const tasks = Array.isArray(tasksResponse) ? tasksResponse : [];

    if (properties.length === 0) {
      return "The landlord's portfolio is currently empty. No properties exist yet.";
    }

    // 1. Calculations
    let totalPortfolioValue = 0;
    let totalMortgageDebt = 0;
    let totalMonthlyRent = 0;
    let vacantUnitsCount = 0;
    let occupiedUnitsCount = 0;

    const propertyLines: string[] = [];

    for (const prop of properties) {
      const pPrice = Number(prop.purchasePrice) || 0;
      totalPortfolioValue += pPrice;

      const monthlyMortgage = Number(prop.monthlyMortgagePayment) || 0;
      totalMortgageDebt += monthlyMortgage * 12 * 20; // 20-year rough amortization

      // Units calculation
      const propUnits = Array.isArray(prop.units) ? prop.units : [];
      let propMonthlyRent = 0;
      let propOccupiedCount = 0;

      for (const unit of propUnits) {
        propMonthlyRent += Number(unit.rentAmount) || 0;
        if (unit.isOccupied) {
          occupiedUnitsCount++;
          propOccupiedCount++;
        } else {
          vacantUnitsCount++;
        }
      }

      totalMonthlyRent += propMonthlyRent;

      const propYield = pPrice > 0 ? ((propMonthlyRent * 12) / pPrice) * 100 : 0;
      const tenantStatus = propOccupiedCount === propUnits.length ? "Fully Occupied" : propOccupiedCount === 0 ? "Vacant" : "Partially Occupied";

      propertyLines.push(
        `- **${prop.propertyName}**: Address: ${prop.streetAddress || ""}, ${prop.city || ""}, ${prop.postcode || ""}. Purchase Price: £${pPrice.toLocaleString()}, Monthly Rent: £${propMonthlyRent.toLocaleString()}, Monthly Mortgage: £${monthlyMortgage.toLocaleString()}, Gross Yield: ${propYield.toFixed(2)}%, Status: ${tenantStatus}`
      );
    }

    // Overdue payments (pending past due date)
    const now = new Date();
    const overduePayments = payments.filter((pay: any) => {
      if (pay.status !== "Pending" && pay.status !== "Overdue") return false;
      const payDate = new Date(pay.date);
      return payDate < now;
    });

    const overdueTotal = overduePayments.reduce((sum: number, pay: any) => sum + (Number(pay.amount) || 0), 0);

    // Active tasks/projects
    const activeTasks = tasks.filter((task: any) => task.status === "in_progress" || task.status === "open");

    // Assemble text context
    let context = `LANDLORD PORTFOLIO CONTEXT:\n`;
    context += `- Total Properties: ${properties.length}\n`;
    context += `- Occupied Units: ${occupiedUnitsCount}, Vacant Units: ${vacantUnitsCount}\n`;
    context += `- Total Portfolio Value: £${totalPortfolioValue.toLocaleString()}\n`;
    context += `- Estimated Total Mortgage Debt: £${totalMortgageDebt.toLocaleString()}\n`;
    context += `- Total Rent: £${totalMonthlyRent.toLocaleString()}/month (£${(totalMonthlyRent * 12).toLocaleString()}/year)\n\n`;

    context += `PER-PROPERTY BREAKDOWN:\n`;
    context += propertyLines.join("\n") + "\n\n";

    if (overduePayments.length > 0) {
      context += `OVERDUE PAYMENTS:\n`;
      context += `- Total Overdue Amount: £${overdueTotal.toLocaleString()} across ${overduePayments.length} pending payments.\n`;
      overduePayments.forEach((pay: any) => {
        context += `  - Payment ID: ${pay._id || pay.id}, Tenant: ${pay.tenant}, Amount: £${pay.amount}, Due Date: ${pay.date}\n`;
      });
      context += "\n";
    } else {
      context += `OVERDUE PAYMENTS: None.\n\n`;
    }

    if (activeTasks.length > 0) {
      context += `ACTIVE PROJECTS/MAINTENANCE:\n`;
      activeTasks.forEach((task: any) => {
        context += `- **${task.title}**: Status: ${task.status}, Priority: ${task.priority}, Estimated Cost: £${(task.cost || 0).toLocaleString()}\n`;
      });
    } else {
      context += `ACTIVE PROJECTS/MAINTENANCE: None.\n`;
    }

    return context;
  } catch (err) {
    return "Error fetching landlord portfolio data. Treat the portfolio as empty.";
  }
}
