import { db } from "@/server/db";
import { auth, clerkClient, EmailAddress } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";


export default async function SyncUser(){
    const {userId} = await auth()

    if(!userId){
        throw new Error('user not found')
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    if(!user.emailAddresses[0]?.emailAddress){
        return notFound()
    }

    await db.user.upsert({
        where :{
            emailAddress : user.emailAddresses[0].emailAddress ?? ""

        },
        update:{
            firstName : user.firstName ?? "",
            lastName : user.lastName ?? "",
            imageUrl:user.imageUrl
        },
        create : {
            emailAddress : user.emailAddresses[0].emailAddress ?? "",
            firstName : user.firstName ?? "",
            lastName : user.lastName ?? "",
            id: userId,
            imageUrl:user.imageUrl
        },
    })
    return redirect('/dashboard')
}