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
    if(!auth.isAuthenticated) return;

    const loadResume = async()=>{
      setLoadingResume(true)

      const resumes = (await kv.list('resume:*',true)) as KVItem[];
      console.log('raw KV entries:', resumes);

      const parsedResumes = (resumes || []).reduce<Resume[]>((acc, item) => {
        try {
          const parsed = JSON.parse(item.value);
          // only include entries that have completed feedback
          if (parsed && parsed.id && parsed.feedback && typeof parsed.feedback === 'object') {
            acc.push(parsed as Resume);
          }
        } catch (e) {
          console.warn('Failed to parse resume entry:', item.key, e);
        }
        return acc;
      }, []);

      const sorted = parsedResumes.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      console.log('loaded resumes:', sorted.length);
      setResumes(sorted);
      setLoadingResume(false);
    }
    loadResume();
  },[auth.isAuthenticated])

  
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
