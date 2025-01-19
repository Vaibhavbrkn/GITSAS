import { db } from '@/server/db';
import {Octokit} from 'octokit';
import axios from 'axios';
import { GitBranch } from 'lucide-react';
import { aiSummariseCommit } from './gemini';


export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})
const githubUrl = 'https://github.com/docker/awesome-compose';

type Response = {
commitHash: string;
commitAuthorAvatar :string;
commitMessage: string;
commitAuthorName: string;
commitDate: string;
}

function getOwnerAndRepo(githubUrl:string){
    const [owner, repo] = githubUrl.split('/').slice(-2);
    return {owner, repo};
}

export const getCommitHash = async(githubUrl:string):Promise<Response[]> => {
    const {owner, repo} = getOwnerAndRepo(githubUrl);
    if(!owner || !repo){
        throw new Error('Invalid Github Url');
    }

    const response = await octokit.rest.repos.listCommits( {
        owner: owner,
        repo: repo
    })


    const sortedCommits = response.data.sort((a:any,b:any) => {
        return new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime();
    });

    return sortedCommits.slice(0,15).map((commit:any): Response => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit.author.date ?? ""
    }));
    
}


export const pollCommits = async(projectId:string)=>{
    const {project, githubUrl} = await fetchProjectGithubUrl(projectId);
    const commithashesh = await getCommitHash(githubUrl);
    const unProcessedCommits = await filterUnProcessedCommits(projectId, commithashesh);
const summaryresponse = await Promise.all(unProcessedCommits.map(async commit => {
    try {
        const summary = await summarizeCommits(githubUrl, commit.commitHash);
        return { status: 'fulfilled', value: summary };
    } catch (error) {
        return { status: 'rejected', reason: error };
    }
}));
const summarises = summaryresponse.map((response) => {
    if(response.status === 'fulfilled'){
        return response.value as string;
    }
});
    const commit = await db.commit.createMany({
        data: summarises.map((summary, index) => {
            return {
                projectId: projectId,
                commitHash: unProcessedCommits[index]?.commitHash ?? '',
                commitMessage: unProcessedCommits[index]?.commitMessage ?? '',
                commitAuthorAvatar: unProcessedCommits[index]?.commitAuthorAvatar ?? '',
                commitDate: unProcessedCommits[index]?.commitDate ?? '',
                commitAuthorName: unProcessedCommits[index]?.commitAuthorName ?? '',
                summary: summary ?? ''
            };
        })
    });

}

async function summarizeCommits(githubUrl:string, commitHashes:string){
    const {data} = await axios.get(`${githubUrl}/commit/${commitHashes}.diff`,{
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    });
    return await aiSummariseCommit(data) || '';
    }




async function filterUnProcessedCommits(projectId:string, commithashesh:Response[]){
    const processedCommits = await db.commit.findMany({
        where: {projectId},
        select: {commitHash: true}
    });

    const processedCommitsHashes = processedCommits.map(commit => commit.commitHash);

    return commithashesh.filter(commithashesh => !processedCommitsHashes.includes(commithashesh.commitHash));
}

async function fetchProjectGithubUrl(projectId:string){
    const project = await db.project.findUnique({
        where: {id: projectId},
        select: {githubUrl: true}
    });

    if(!project?.githubUrl){
        throw new Error('Project does not have a github url');
    }

    return {project, githubUrl:project?.githubUrl};
}