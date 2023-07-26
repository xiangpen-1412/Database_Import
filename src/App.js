import './App.css';
import {useState} from "react";
import axios from "axios";

const Header = () => {

    return (
        <header className="header">
            <div className="header-content">
                <img alt="University of Alberta logo" src="uofalogo.png" className="image"/>
                <div className="site-title">
                    ExcelToDB
                </div>
            </div>

        </header>
    );
};

const PageTitle = () => {
    return (
        <div style={{
            margin: "25px 0px 40px 0px",
            color: "#275d38",
            fontSize: "53px",
            fontFamily: "'Roboto', sans-serif",
            fontWeight: "300"
        }}>
            DataBase Import
        </div>
    );
}

const ExcelTypeList = () => {
    const [selectedProject, setSelectedProject] = useState('Visualizer');
    const [selectedFileType, setSelectedFileType] = useState('Course');

    const excelTypeMap = new Map([
        ['Visualizer', ['Course', 'Course Category', 'Graduate Attributes']],
        ['Scheduler', ['Course Info', 'Accreditation Units', 'Sequence']],
    ])

    const handleOnChange = (projectType) => {
        setSelectedProject(projectType);
    }

    excelTypeMap.forEach((value, key) => {
        return (
            <div
                className='projectType'>
                {key}
            </div>
        )
    })
}

const Footer = () => {

    return (
        <footer className="footer">
            <div className='topBorder'>
                <div className='imageDiv'>
                    <a>
                        <img alt="University of Alberta logo" src="uofalogo.png" className="footerImage"/>
                    </a>
                </div>
                <div className='footerTag'>
                    @ 2023 University of Alberta
                </div>
            </div>
        </footer>
    );
};

function App() {
    const [selectedFile, setSelectedFile] = useState(null);

    const fileSelectedHandler = event => {
        setSelectedFile(event.target.files[0]);
    };

    const fileUploadHandler = () => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        axios.post("/upload", formData)
            .then(response => console.log(response))
            .catch(error => console.error(error));
    };

    return (
        <div>
            <Header/>

            <div className='DBWrapper'>
                <PageTitle />

                <ExcelTypeList />
                <input type="file" onChange={fileSelectedHandler} />
                <button onClick={fileUploadHandler}>Upload</button>
            </div>

            <Footer />
        </div>
    );
}

export default App;
