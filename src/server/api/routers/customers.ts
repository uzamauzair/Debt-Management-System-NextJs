import { z } from "zod"
import axios from "axios"
import { SuperAdminOrCashierProcedure, createTRPCRouter } from '../trpc'
import { env } from "../../../env.mjs";
import { formatPhoneNumber } from "../../../utils/constant";

export const customerRouter = createTRPCRouter({
    //
    create: SuperAdminOrCashierProcedure.input(z.object({
        customer_name: z.string(),
        phone_number: z.string(),
        nic: z.string(),
        address: z.string()
    })).mutation(async ({ ctx, input }) => {
        //
        const customerCreated = await ctx.prisma.customers.create({
            data: {
                customer_name: input.customer_name,
                phone_number: input.phone_number,
                nic: input.nic,
                address: input.address
            }
        })
        if (customerCreated) {
            //Send SMS to the customer when register 
            const apiUrl = env.SMS_GATEWAY_API_URL;
            const accessToken = env.SMS_GATEWAY_ACCESS_TOKEN;

            // format with countrycode
            const phone_number = formatPhoneNumber(input.phone_number);
            const recipient = `${phone_number}`;
            const senderId = env.SMS_GATEWAY_SENDER_ID;
            const message = `Hello ${input.customer_name} Thank you for registering with Smart Debt Manager at CoolCity. We're excited to help you manage your debts effectively. Good luck on your journey!`;
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
        //
        return customerCreated
    }),

    updateImages: SuperAdminOrCashierProcedure.input(z.object({ id: z.number(), images: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
        return await ctx.prisma.customers.update({
            where: { customer_id: input.id },
            data: {
                nic_photo: {
                    set: [...input.images],
                },
            },
        });
    }),
})