'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import useProject from "@/hooks/use-project"
import { api } from "@/trpc/react"
import AskQuestion from "../dashboard/ask-question"
import React from "react"
import MDEditor from "@uiw/react-md-editor"
import CodeReferences from "../dashboard/code-references"

const QAPage = ()=>{
    const {projectId} = useProject()
    const {data:questions} = api.project.getQuestions.useQuery({projectId})
    const [questionIdx, setQuestionIdx] = React.useState(0)
    const question = questions?.[questionIdx]
    return (
        <Sheet>
            <AskQuestion/>
            <div className="h-4"></div>
            <h1 className="text-xl font-semibold">Saved Questions</h1>
            <div className="flex flex-col gap-2 ">
                {questions?.map((question,index)=>{
                    return <React.Fragment key={question.id}>
                        <SheetTrigger onClick={()=>setQuestionIdx(index)}>
                            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                                <img className="rounded-full" height={30} width={30} src={question.user.imageUrl ?? ""}/>
                                <div className="text-left flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-700 line-clamp-1 font-medium">
                                            {question.question}
                                        </p>
                                        <span className="text-xs text-grid-400 whitespace-nowrap">
                                            {question.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 line-clamp-1 text-sm">
                                        {question.answer}
                                    </p>
                                </div>
                            </div>

                        </SheetTrigger>
                    </React.Fragment>
                })}
            </div>
            {question && (
                                <SheetContent className="sm:max-w-[80vw]">
                                    <SheetHeader>
                                        <SheetTitle>
                                            {question.question}
                                        </SheetTitle>
                                    </SheetHeader>
                                    <MDEditor.Markdown source={question.answer} className="max-w-[70vw] !h-full max-h-[50vh] overflow-scroll"/>
                                    <CodeReferences fileReferences={question.filesReferences?? [] as any }/>
                                </SheetContent>
                            )}
        </Sheet>
    )
}

export default QAPage