import React, { useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import FileUploader from '~/components/FileUploader'
import { usePuterStore } from '~/lib/puter'
import { useNavigate } from 'react-router'
import { convertPdfToImage } from '~/lib/pdf2img'
import { generateUUID } from '~/utils'
import { prepareInstructions, AIResponseFormat } from 'constants/index'


const Upload = () => {

    const {auth,isLoading,fs,ai,kv} = usePuterStore();
    const navigate= useNavigate();
    const [isProcessing, setisProcessing] = useState (false)
    const [statusText, setstatusText] = useState('')
    const [file,setFile] = useState<File | null>(null)
    const [companyName, setCompanyName] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [jobDescription, setJobDescription] = useState('')

    const handleFileSelect=(file:File|null)=>{
        setFile(file)
    }

    const handleAnalyze = async ({companyName,jobTitle,jobDescription,file}: {companyName:string,jobTitle:string,jobDescription:string,file:File})=>{
        try {
            setisProcessing(true);
            setstatusText("uploading file ...");
            const uploadedFile = await fs.upload([file]);

            if(!uploadedFile) {
                setstatusText('Error: Failed to upload file');
                setisProcessing(false);
                return;
            }
            
            setstatusText('converting to image..');

            const imageFile = await convertPdfToImage(file);

            if(!imageFile.file || imageFile.error) {
                setstatusText(`Error: ${imageFile.error || 'Failed to convert PDF to Image'}`);
                setisProcessing(false);
                return;
            }
            
            setstatusText("Uploading the Image...");

            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setstatusText('Error: Failed to upload image');
                setisProcessing(false);
                return;
            }
            
            setstatusText("preparing data...");

            const uuid = generateUUID();

            const data = {
                id:uuid,
                resumePath:uploadedFile.path,
                imagePath:uploadedImage.path,
                companyName,jobTitle,jobDescription,
                feedback:'',
                createdAt: new Date().toISOString(),
            }
            await kv.set(`resume:${uuid}`,JSON.stringify(data));

            setstatusText('analyzing...')

            try {
                const feedback = await ai.feedback(
                    uploadedFile.path,
                    prepareInstructions({jobTitle,jobDescription, AIResponseFormat})
                );

                if(!feedback) {
                    setstatusText('Error: AI analysis failed - no response received');
                    setisProcessing(false);
                    return;
                }

                const feedbackText = typeof feedback.message.content === 'string' 
                    ? feedback.message.content 
                    : feedback.message.content[0].text;

                if (!feedbackText) {
                    setstatusText('Error: AI response is empty');
                    setisProcessing(false);
                    return;
                }

                // Validate JSON before parsing (strip markdown code fences if present)
                let parsedFeedback;
                try {
                    const cleanedText = feedbackText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
                    parsedFeedback = JSON.parse(cleanedText);
                } catch (jsonError) {
                    console.error('JSON parsing error:', jsonError);
                    console.error('Raw AI response:', feedbackText);
                    setstatusText('Error: Invalid AI response format');
                    setisProcessing(false);
                    return;
                }

                // Validate the structure of the parsed feedback
                if (!parsedFeedback || typeof parsedFeedback.overallScore !== 'number') {
                    console.error('Invalid feedback structure:', parsedFeedback);
                    setstatusText('Error: AI response missing required fields');
                    setisProcessing(false);
                    return;
                }

                data.feedback = parsedFeedback;
                await kv.set(`resume:${uuid}`, JSON.stringify(data));
                setstatusText("analysis complete redirecting ...");
                console.log(data);
                navigate(`/resume/${uuid}`);
            } catch (error) {
                console.error('AI analysis error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                setstatusText(`Error during analysis: ${errorMessage}`);
                setisProcessing(false);
            }
        } catch (error) {
            console.error('Upload process error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setstatusText(`Error: ${errorMessage}`);
            setisProcessing(false);
        }
    }

    const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const form = e.currentTarget.closest('form');

        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string
        const jobTitle = formData.get('job-title') as string
        const jobDescription = formData.get('job-description') as string
        
        if(!file) return
        handleAnalyze({companyName,jobTitle,jobDescription,file});

    }

  return (
  <main className="bg-[url('/images/bg-main.svg')] bg-cover ">
    <Navbar />
    <section className='main-section py-16'>
        <div className='page-heading'>
            <h1>Smart feedback for your dream job</h1>
            {isProcessing ?(
            <>
              <h2>{statusText}</h2>  
              <img src="/images/resume-scan.gif" className='w-full' alt="" />
            </>
            ):(
                <h2>Drop your Resume for ATS score and improvement tips</h2>
            )}

            {!isProcessing && (
                <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                    <div className='form-div'>
                        <label htmlFor="company-name">Company Name</label>
                        <input type="text" name='company-name' placeholder='Company name' id='company-name' value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>

                    <div className='form-div'>
                        <label htmlFor="job-title">Job Title</label>
                        <input type="text" name='job-title' placeholder='Job Title' id='job-title' value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                    </div>

                    <div className='form-div'>
                        <label htmlFor="job-description">Job Description</label>
                        <textarea rows={5} name='job-description' placeholder='Job Description' id='job-description' value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                    </div>

                    <div className='form-div'>
                        <label htmlFor="uploader">Upload Resume</label>
                        <FileUploader onFileSelect = {handleFileSelect}/>
                    </div>

                    <button type='submit' className='primary-button'>
                        Analyze Resume
                    </button>

                </form>

            )}
        </div>
    </section>
    </main>
  )
}

export default Upload