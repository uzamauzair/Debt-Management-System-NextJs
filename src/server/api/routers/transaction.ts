import { z } from "zod";
import axios from "axios"
import moment from "moment"
import { SuperAdminOrCashierProcedure, createTRPCRouter } from "../trpc";
import { env } from "../../../env.mjs";
import { calculateNewDebtBalance, formatPhoneNumber, generateMessage } from "../../../utils/constant";

export const transactionRouter = createTRPCRouter({
    create: SuperAdminOrCashierProcedure.input(z.object({
        customer_id: z.string(),
        amount: z.number().multipleOf(0.01),
        type: z.union([z.literal("debt"), z.literal("payment")]),
        transaction_details: z.string()
    })).mutation(async ({ ctx, input }) => {
        // get the customer_id to integer format
        const customerId = parseInt(input.customer_id);
        const userId = parseInt(ctx.session.user.id.toString())
        //
        //Create the transactions
        const transactionCreated = await ctx.prisma.transactions.create({
            data: {
                customer_id: customerId,
                amount: input.amount,
                transaction_type: input.type,
                user_id: userId,
                transaction_details: input.transaction_details
            }
        })

        // getting all the transactions of the customer
        const transactions = await ctx.prisma.transactions.findMany({
            where: {
                customer_id: customerId
            }
        })
        //calculating the total debt balance
        const totalDebt = await calculateNewDebtBalance(transactions);
        //
        if (transactionCreated) {
            //Send SMS to the customer when register 
            const apiUrl = env.SMS_GATEWAY_API_URL;
            const accessToken = env.SMS_GATEWAY_ACCESS_TOKEN;
            //
            // find the phone number of the customer
            const customer = await ctx.prisma.customers.findUnique({
                where: { customer_id: customerId }, select: {
                    phone_number: true, customer_name: true
                }
            });
            // format with countrycode
            const phone_number = formatPhoneNumber(customer?.phone_number);
            const recipient = `${phone_number}`;
            const senderId = env.SMS_GATEWAY_SENDER_ID;
            const message = generateMessage(customer?.customer_name, input.type, input.amount, totalDebt);
            //
            const payload = {
                recipient,
                sender_id: senderId,
                message
            };
            axios.post(apiUrl, JSON.stringify(payload), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    console.log('Message sent successfully!', response.data);
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                });
        }

        return transactionCreated;
    }),

    lastMonthTransactions: SuperAdminOrCashierProcedure.mutation(async ({ ctx }) => {

        const lastMonthsTransactions = await ctx.prisma.transactions.findMany({
            where:
            {
                transaction_date: {
                    gte: moment().subtract({ months: 1 }).toDate()
                }
            }
            ,
            include: {
                customer: {
                    select: {
                        customer_name: true,
                    },
                },
                user: {
                    select: {
                        username: true,
                    },
                },
            },
            orderBy: {
                transaction_date: "desc"
            }
        });
        return lastMonthsTransactions;
    })
})