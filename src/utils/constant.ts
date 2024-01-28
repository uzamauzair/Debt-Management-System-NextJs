
import { Transactions } from "@prisma/client";
import { prisma } from "../server/db";

// get cashier type
// export const CASHIER_ROLE_ID: any | undefined = await prisma.roles.findFirst({
//     where: {
//         role_type: "cashier"
//     }
// })

// get cashier type
export async function getCashierRoleId() {
    const cashierRole = await prisma.roles.findFirst({
        where: {
            role_type: "cashier"
        }
    });
    return cashierRole?.role_id
}

export const digits = "0123456789";
export const ONE_HOUR = 60 * 60 * 1000;

export function formatPhoneNumber(phoneNumber: any): string {
    // Remove leading '0' and add '+94'
    const formattedNumber = `+94${phoneNumber.substring(1)}`;
    return formattedNumber;
}
//
export function generateMessage(name: any, type: string, amount: number, newDebtBalance: number): string {
    //
    const currentTime = new Date().toLocaleTimeString(); // Replace this with the actual time
    const messageType = type === "debt" ? "made a debt of" : "made a payment of";
    const emoji = type === "debt" ? "🌟" : "💰";
    const thankYou = type === "debt" ? "We're here to support you!" : "Thank you for your payment!";
    //
    const smsMessage = `${emoji} Hello ${name}! You've just ${messageType} Rs. ${amount} at ${currentTime}. Your new remaining debt balance stands at Rs. ${newDebtBalance}. ${thankYou} 🎉`;
    //
    return smsMessage;
}
//
export async function calculateNewDebtBalance(transactions: Transactions[]): Promise<number> {
    const newDebtBalance = transactions.reduce((balance, transaction) => {
        if (transaction.transaction_type === 'debt') {
            return balance + transaction.amount;
        } else if (transaction.transaction_type === 'payment') {
            return balance - transaction.amount;
        } else {
            return balance;
        }
    }, 0);
    return newDebtBalance;
}