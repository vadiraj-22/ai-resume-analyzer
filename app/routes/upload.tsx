import React, { useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import FileUploader from '~/components/FileUploader'


const Upload = () => {

    const [isProcessing, setisProcessing] = useState (false)
    const [statusText, setstatusText] = useState('')
    const [file,setFile] = useState<File | null>(null)
    const [companyName, setCompanyName] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [jobDescription, setJobDescription] = useState('')

    const handleFileSelect=(file:File|null)=>{
        setFile(file)
    }

    const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        
        console.log({
            companyName,jobTitle,jobDescription,file
        })
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