import Body from './components/Body';
import { Navbar } from './components/Navbar';




function App() {
  return (
    <div className='bg-[#f3f4f6] min-h-screen w-full flex flex-col items-center'>
      <Navbar />
      <Body />
    </div>
  )
}

export default App