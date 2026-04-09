import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter'


const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback,imagePath } }: { resume: Resume }) => {

      const {fs} = usePuterStore();
    const [resumeURL, setResumeURL] = useState('');

    useEffect(()=>{
    let objectUrl: string;
    const loadResume = async()=>{
      try {
        const blob = await fs.read(imagePath)
        if(!blob) return
        objectUrl = URL.createObjectURL(blob);
        setResumeURL(objectUrl)
      } catch(e) {
        console.error('Failed to load resume image:', e)
      }
    }
    if(imagePath) loadResume();
    return () => { if(objectUrl) URL.revokeObjectURL(objectUrl) }
  },[imagePath, fs])
    return (
        <Link to={`/resume/${id}`} className='resume-card animate-in fade-in duration-1000'>

            <div className='resume-card-header'>
                <div className=' flex flex-col gap-2'>
                    { companyName && 
                        <h2 className='text-black! font-bold wrap-break-words'>
                            {companyName}
                        </h2>
                    }

                    {jobTitle && 
                    <h3 className='text-lg wrap-break-words text-gray-500'>
                        {jobTitle}
                    </h3>
                    }

                    {!companyName && !jobTitle && 
                        <h2 className='text-black!'>
                            Resume
                        </h2>
                    }

                </div>

                <div className='flx-shrink-0'>
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {
            resumeURL &&
            <div className='gradient-border animate-in fade-in duration-1000'>
                <div className='w-full h-full'>
                    <img src={resumeURL} alt="resume" className='w-full h-87.5 max-sm:h-50 object-cover object-top' />
                </div>
            </div>
            }   


        </Link>
    )
}

export default ResumeCard
