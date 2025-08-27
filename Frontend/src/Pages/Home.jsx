import About from "../Components/Homepage/About"
import Contact from "../Components/Homepage/Contact"
import Features from "../Components/Homepage/Features"

import Landing from "../Components/Homepage/Landing"
import Story from "../Components/Homepage/Story"

const Home = () => {
  return (
     <main className="relative overflow-x-hidden min-h-screen cursor-none w-screen ">
      
      <Landing/>
      <About/>
      <Features/>
      <Story/>
      <Contact />
      
    </main>
  )
}

export default Home
