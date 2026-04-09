import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import {  Link, useNavigate } from "react-router";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const {auth,kv} = usePuterStore();
  const navigate = useNavigate();
const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResume, setLoadingResume] = useState(false)



  useEffect(()=>{
    if(!auth.isAuthenticated) navigate('/auth?next=/')
  },[auth.isAuthenticated])

  useEffect(()=>{
    const loadResume = async()=>{
      setLoadingResume(true)

      const resumes = (await kv.list('resume:*',true)) as KVItem[];

      const parsedResumes = resumes?.map((resume)=>{
        return JSON.parse(resume.value) as Resume
      })

      console.log('parsed Resumes ' ,parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResume(false);
    }
    loadResume();
  },[])

  
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover ">
    <Navbar />
    <section className="main-section ">
      <div className="page-heading">
        <h1>Track your application & resume ratings</h1>
        {!loadingResume && resumes?.length == 0 ?(<h2>
          No Resume Found . Upload your first resume to get feedback
        </h2>) :( 
          <h2>Review your submission and check AI-powered feedback.</h2>
        )}
      </div>

      {loadingResume && (
        <div className="flex flex-col justify-center items-center"><img src="/images/resume-scan-2.gif" className="w-50" alt="" /></div>
      )}

     {!loadingResume && resumes.length > 0 && (
        <div className="resumes-section py-16">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {!loadingResume && resumes?.length === 0 &&(
        <div className="flex flex-col items-center justify-center mt-10 gap -4x">
          <Link to='/upload' className="primary-button w-fit text-xl  font-semibold">
            Upload Resume
          </Link>
        </div>
      ) }

    </section>
  </main>
} 
