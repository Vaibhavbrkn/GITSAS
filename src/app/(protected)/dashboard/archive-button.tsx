'use client'

import { Button } from "@/components/ui/button"
import useProject from "@/hooks/use-project"
import useRefetch from "@/hooks/use-refetch"
import { api } from "@/trpc/react"
import { usePrefetchInfiniteQuery } from "@tanstack/react-query"
import { toast } from "sonner"

 const  ArchiveButton = ()=>{
    const archiveProject = api.project.archiveProject.useMutation()
    const {projectId} = useProject()
    const refetch = useRefetch()
    return (
        <div>
            <Button disabled= {archiveProject.isPending} size='sm' variant='destructive' onClick={()=>archiveProject.mutate({projectId}, {
                onSuccess:()=>{
                    toast.success('Project Archieved')
                    refetch()
                },
                onError:()=>{
                    toast.error('Failed to archieve project')
                }
            })}>
                Archieve
            </Button>
        </div>
    )
}

export default ArchiveButton