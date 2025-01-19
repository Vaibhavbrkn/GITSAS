'use client'
import { Card } from "@/components/ui/card"
import { uploadFile } from "@/lib/firebase"
import { Presentation, Upload } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import {useDropzone} from 'react-dropzone'
import { Input } from "@/components/ui/input"
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar'
import { api } from "@/trpc/react"
import useProject from "@/hooks/use-project"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"

const MeetingCard = ()=>{

    const {project} = useProject()
    const processMeeting = useMutation({mutationFn:async(data:{meetingUrl:string, meetingId:string, projectId:string})=>{
        const {meetingUrl, meetingId,projectId} = data
        const response = await axios.post('/api/process-meeting', {meetingUrl, meetingId,projectId})
        return response.data
    }})
    const [progress, setProgress] = React.useState(0)
    const [isUploading, setIsuploading] = React.useState(false)
    const router = useRouter()
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const {getRootProps, getInputProps} = useDropzone({
        accept:{
            'audio/*':['.mp3', '.wav', '.m4a']
        },
        multiple:false,
        maxSize:60_000_000,
        onDrop:async acceptedFiles=>{
            if(!project) return 
            const file = acceptedFiles[0]
            if(!file) return 
            setIsuploading(true)
            const downloadURL = await uploadFile(file as File, setProgress) as string
            uploadMeeting.mutate({
                meetingUrl:downloadURL,
                name:file.name,
                projectId:project.id
            }, {
                onSuccess:(meeting)=>{
                    toast.success('Meeting Uploaded')
                    router.push('/meetings')
                    processMeeting.mutateAsync({meetingUrl:downloadURL, meetingId:meeting.id, projectId:project.id})
                },
                onError:()=>{
                    toast.error('Failed to upload')
                }
            })
            setIsuploading(false)
        }

    })

    return (
        <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
            {!isUploading && (
                <>
                <Presentation className="h-10 w-10 animate-bounce"/>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Create a New Meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analuse your meeting with US
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <Upload className="ml-0.5 mr-1.5 h-5 w-5" aria-hidden='true'/>
                            Upload Meeting 
                            <input className="hidden" {...getInputProps()}/>
                        </Button>
                    </div>
                </>
            )}

            {isUploading && (
                <div >
                    <CircularProgressbar value={progress} text = {`${progress}%`} className="size-20" styles = {
                        buildStyles({
                            pathColor:'#2563eb',
                            textColor:'#2563eb'
                        })
                    }/>
                    <p className="text-sm text-gray-500 text-center">
                        Uploading your meeting
                    </p>
                </div>
            )}
        </Card>
    )
}

export default MeetingCard