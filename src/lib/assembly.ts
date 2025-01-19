import {AssemblyAI} from 'assemblyai'

const apiKey = process.env.ASSEMBLYAI_API_KEY;
if (!apiKey) {
  throw new Error('ASSEMBLYAI_API_KEY is not defined');
}
const client = new AssemblyAI({apiKey});

function msToTime(ms:number){
    const seconds = ms/100
    const minutes = Math.floor(seconds/60)
    const remainingSeconds = Math.floor(seconds%60)
    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}.`
}

export const processMeetings = async (meetingUrl:string)=>{
    const transcript = await client.transcripts.transcribe({
        audio:meetingUrl,
        auto_chapters: true,
    })

    const summaries = transcript.chapters?.map(chapter=>({
        start:msToTime(chapter.start),
        end:msToTime(chapter.end),
        gist:chapter.gist,
        headline:chapter.headline,
        summary:chapter.summary

    })) || []

    if(!transcript.text) throw new Error('No Transcript found')

    return {
        summaries
    }
}

const file_url = 'https://assembly.ai/wildfires.mp3'

const response = await processMeetings(file_url)
console.log(response)