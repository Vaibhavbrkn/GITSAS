'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import useProject from "@/hooks/use-project"
import Image from "next/image"
import React from "react"
import { askQuestion } from "./actions"
import { readStreamableValue } from "ai/rsc"
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from "./code-references"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"

const AskQuestion = ()=>{
    const {project} = useProject()
    const [question, setQuestion] = React.useState('')
    const [answer, setAnswer] = React.useState('')
    const [open ,setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [output, setOutput] = React.useState<ReadableStream<Uint8Array> | null>(null)
    const [fileReferences, setFileReferences] = React.useState<{fileName:string,sourceCode:string, summary:string}[]>()
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e:React.FormEvent)=>{
        e.preventDefault()
        setAnswer('')
        setFileReferences([])
        if(!project?.id) return 
        setLoading(true)
        setOpen(true)

        const {output, fileReferences} = await askQuestion(question, project.id)
        setFileReferences(fileReferences)
        if (output) {
            for await (const delta of readStreamableValue(output)){
                if(delta){
                    setAnswer(ans => ans + delta)
                }
            }
        }
        setLoading(false)
        }

        const refetch = useRefetch()
        
    
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw]">
                    <DialogHeader >
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                <Image src = '/logo.png' alt='logo' width={40} height={40} />
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant={'outline'} onClick = {()=>{
                                saveAnswer.mutate({
                                    projectId:project!.id,
                                    question,
                                    answer,
                                    fileReferences
                                },{
                                    onSuccess:()=>{
                                        toast.success('Answer Saved')
                                        refetch()
                                    },
                                    onError:()=>{
                                        toast.error('Failed to save answer')
                                    }
                                })
                            }}>
                                Save Answer
                            </Button>
                        </div>

                        </DialogHeader>
                        <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[30vh] overflow-scroll"/>
                        <div className="h-4"></div>
                        <CodeReferences fileReferences={fileReferences|| []}/>

                        <Button type = 'button' onClick={()=>{setOpen(false)}}>
                            Close
                        </Button>

                    </DialogContent>
            </Dialog>
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>
                        Ask a Question
                        </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea onChange={(e)=>setQuestion(e.target.value)} value={question} placeholder="Which file should I edit to change the home page?"/>
                        <div className='h-4'></div>
                            <Button type="submit" disabled={loading}>Ask</Button>
                        
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestion