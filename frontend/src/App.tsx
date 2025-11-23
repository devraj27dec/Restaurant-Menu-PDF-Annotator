import { pdfjs } from "react-pdf";
import PdfUploadPreview from "./components/Uploader";
import { BrowserRouter as Router , Routes , Route}  from 'react-router-dom'
import Menus from "./Menus";
import {Toaster} from 'react-hot-toast'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PdfUploadPreview/>}/>
        <Route path="/menu-list" element={<Menus/>}/>
      </Routes>
      <Toaster/>
    </Router>
  );
};

export default App;



