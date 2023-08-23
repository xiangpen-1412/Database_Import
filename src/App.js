import './App.css';
import {useEffect, useRef, useState} from "react";
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
            width: "80%",
            margin: "25px auto 40px auto",
            color: "#275d38",
            fontSize: "53px",
            fontFamily: "'Roboto', sans-serif",
            fontWeight: "300"
        }}>
            DataBase Import
        </div>
    );
}

const ExcelTypeList = (props) => {

    const excelTypeMap = new Map([
        ['Visualizer', ['Petroleum', 'Mining', 'Mechatronics', 'MECE', 'Materials', 'Engg Physics', 'Electrical', 'Computer', 'Civil', 'Chemical']],
        ['Scheduler', ['Course Info', 'Accreditation Units']],
    ])

    const handleOnChange = (projectType) => {
        if (projectType !== props.selectedProject) {
            props.setSelectedProject(projectType);
        }
    }

    const handleFileOnChange = (fileType) => {
        props.setSelectedFileType(fileType);
    }

    const types = Array.from(excelTypeMap.keys()).map((key) => {
        const defaultCheck = key === 'Visualizer';

        return (
            <div className='projectType'>
                <input
                    type='radio'
                    name='type'
                    value={key}
                    defaultChecked={defaultCheck}
                    onChange={() => handleOnChange(key)}
                />
                <span className='typeName'>{key}</span>
            </div>
        )
    })

    useEffect(() => {
        props.setSelectedFileType(excelTypeMap.get(props.selectedProject).at(0));
    }, [props.selectedProject])

    const subTypeList = excelTypeMap.get(props.selectedProject);
    const subTypes = subTypeList.map((subType) => {
        const checked = subType === props.selectedFileType;
        const className = props.selectedProject === 'Visualizer' ? 'subtypeVisualizer' : 'subType';
        return (
            <div className={className}>
                <input
                    type='radio'
                    name='subType'
                    checked={checked}
                    onChange={() => handleFileOnChange(subType)}
                />
                <span className='subTypeName'>{subType}</span>
            </div>
        )
    })

    return (
        <div className='excelTypeList'>
            <div className='selectionDescription'>
                SELECT FILE TYPE
            </div>
            <div className='radioPart'>
                <div className='projectTypes'>
                    {types}
                </div>
                <div className='fileTypesVisualizer'>
                    {subTypes}
                </div>
            </div>
        </div>
    )
}

const Upload = (props) => {

    const [selectedTags, setSelectedTags] = useState([]);

    const selectedFiles = props.selectedFiles;
    const selectedProject = props.selectedProject;
    const selectedFileType = props.selectedFileType;

    const files = props.selectedFiles.map((selectedFile, index) => {

        let isSelected = false;
        if (selectedTags) {
            isSelected = selectedTags.includes(selectedFiles[index].name);
        }

        return (
            <div
                className='indivFile'
                style={{backgroundColor: isSelected ? '#cccccc' : null}}
                onClick={() => handleIndivFileOnClick(selectedFiles[index].name)}
            >
                {selectedFiles[index].name}
            </div>
        )
    })

    // highlight or unhighlight the selected tag
    const handleIndivFileOnClick = (fileName) => {
        const files = [...selectedTags];
        if (!selectedTags.includes(fileName)) {
            files.push(fileName);
            setSelectedTags(files);
        } else {
            const newFiles = files.filter(file => file !== fileName);
            setSelectedTags(newFiles);
        }
    }

    // remove the selected files
    const handleDeleteOnClick = () => {
        const tags = [...selectedTags];
        const log = [...props.log];
        setSelectedTags([]);
        let files = props.selectedFiles;
        tags.forEach((tag) => {
            files = files.filter(item => item.name !== tag);
            log.push(`${tag} is deleted`);
        })
        log.push("---------------------------------------------------------------------------------------------------------------------------------");

        props.setSelectedFiles(files);
        props.setLog(log);
    }

    // remove all the files
    const handleDeleteAllOnClick = () => {
        const log = [...props.log];
        const files = props.selectedFiles;
        files.forEach((file) => {
            log.push(`${file.name} is deleted`);
        });

        log.push("---------------------------------------------------------------------------------------------------------------------------------");

        setSelectedTags([]);
        props.setSelectedFiles([]);
        props.setLog(log);
    }

    /**
     * handle the data import http request
     *
     * send different http request to update the database and update the log
     * */
    const handleHttpRequest = (url, formData, filetype) => {

        // TODO: Need to be changed when the server host changes
        const serverUrl = "http://129.128.215.39:1412";
        const generalUrl = "/nobes/timetable/core";

        const loadingLog = [...props.log];
        loadingLog.push("Updating...");
        props.setLog(loadingLog);

        axios.post(`${generalUrl}${url}`, formData)
            .then(response => {
                const message = response.data.obj;
                const log = loadingLog;
                log.push(filetype + " data uploads successfully");
                log.push("---------------------------------------------------------------------------------------------------------------------------------");
                props.setLog(log);
            })
            .catch(error => {
                const errorMessage = "Error fetching data: " + error;
                const updatedLog = [...props.log, errorMessage, "---------------------------------------------------------------------------------------------------------------------------------"];
                props.setLog(updatedLog);
            });
    };


    /**
     * an intermediate function to send the http request
     * */
    const handleFileUpload = (project, fileType, formData) => {
        if (project === 'Visualizer') {
            const file = formData.get('file');

            if (file.name.toLowerCase().includes('sequen') || file.name.toLowerCase().includes('mechatronics_program_v')) {
                formData.append('program', fileType);
                handleHttpRequest('/sequenceImport', formData, fileType);
            } else if (file.name.toLowerCase().includes('categories')) {
                handleHttpRequest('/visualizerGroupImport', formData, fileType);
            } else if (file.name.toLowerCase().includes('courses')) {
                handleHttpRequest('/visualizerCourseImport', formData, fileType);
            } else {
                return null;
            }
        } else if (project === 'Scheduler') {
            // scheduler course info import
            if (fileType === 'Course Info') {
                handleHttpRequest('/timeTableImport', formData, fileType);
            } else {
                handleHttpRequest('/auImport', formData, fileType);
            }
        } else {
            return null;
        }
    }

    const handleUploadOnClick = (project, fileType, files, selectedTags) => {
        let isNull = true;
        for (let i = 0; i < files.length; i++) {
            if (selectedTags.includes(files[i].name)) {
                isNull = false;
                const formData = new FormData();
                formData.append('file', files[i]);
                handleFileUpload(project, fileType, formData);
            }
        }

        if (isNull) {
            const newLog = [...props.log];
            newLog.push("Select a file to upload");
            newLog.push("---------------------------------------------------------------------------------------------------------------------------------");
            props.setLog(newLog);
        }

        setSelectedTags([]);

        // get all files
        const allFiles = [...props.selectedFiles];
        let uploadedFiles = []; // store uploaded files

        // get file name from formData
        for (const tag in selectedTags) {
            uploadedFiles.push(tag);
        }

        // remove uploaded files
        const remainingFiles = allFiles.filter(file => !uploadedFiles.includes(file.name));
        props.setSelectedFiles(remainingFiles);
    }

    const handleUploadAllOnClick = (project, fileType, files) => {
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            handleFileUpload(project, fileType, formData);
        }

        setSelectedTags([]);
        props.setSelectedFiles([]);
    }

    /**
     * send truncate table http request
     * */
    const handleDeleteHttpRequest = (url, type) => {
        const generalUrl = "/nobes/timetable/core";
        axios.get(`${generalUrl}${url}`)
            .then(response => {
                const log = [...props.log];
                log.push(type + " truncate completes");
                log.push("---------------------------------------------------------------------------------------------------------------------------------");
                props.setLog(log);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    /**
     * truncate tables about selected file types
     * */
    const handleTruncateClick = (project, fileType) => {
        if (project === 'Visualizer') {
            // truncate all data about visualizer
            handleDeleteHttpRequest('/truncateSequence', 'Visualizer data');
            handleDeleteHttpRequest('/truncateVisualizer', 'Visualizer data');
            handleDeleteHttpRequest('/truncateCourseGroup','Visualizer data');
        } else if (project === 'Scheduler') {
            // scheduler course info import
            if (fileType === 'Course Info') {
                handleDeleteHttpRequest('/truncateTimetable', 'Scheduler Course Info');
            } else {
                handleDeleteHttpRequest('/truncateAU', 'AU');
            }
        } else {
            return null;
        }
    }

    return (
        <div className='upload'>
            <div className='fileLists'>
                {files}
            </div>
            <div className='buttons'>
                <button className='button' onClick={handleDeleteOnClick}>Delete</button>
                <button className='button' onClick={handleDeleteAllOnClick}>Delete All</button>
                <button className='button'
                        onClick={() => handleUploadOnClick(selectedProject, selectedFileType, selectedFiles, selectedTags)}>Upload
                </button>
                <button className='button'
                        onClick={() => handleUploadAllOnClick(selectedProject, selectedFileType, selectedFiles)}>Upload
                    All
                </button>
                <button className='button'
                        onClick={() => handleTruncateClick(selectedProject, selectedFileType)}>Delete
                </button>
            </div>
        </div>
    )
}

const Console = (props) => {
    const endRef = useRef(null);

    const logs = props.log.map((indivLog, index) => {
        return (
            <p className='log'>{indivLog}</p>
        )
    })

    useEffect(() => {
        endRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [props.log]);

    return (
        <div className='consoleWindow'>
            {logs}
            <div ref={endRef}/>
        </div>
    )
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
    // states for the 'SELECT FILE TYPE'
    const [selectedProject, setSelectedProject] = useState('Visualizer');
    const [selectedFileType, setSelectedFileType] = useState(null);

    // states for data import
    const [selectedFiles, setSelectedFiles] = useState([]);

    // create a ref for the hidden input tag in order to manipulate it
    const fileInput = useRef(null);

    // console log
    const [log, setLog] = useState([]);

    // trigger the onChange of file input tag
    const handleOnClick = () => {
        fileInput.current.click();
    }

    // save the selected files
    const handleSelectedFile = event => {
        const files = [...selectedFiles];
        const fileArray = Array.from(event.target.files);
        const logInfo = [...log];

        fileArray.forEach((file) => {
            if (!files.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
                files.push(file);
                logInfo.push(`${file.name} is selected`);
            } else {
                logInfo.push(`${file.name} has been selected`);
            }
        })

        logInfo.push("---------------------------------------------------------------------------------------------------------------------------------");
        setLog(logInfo);

        setSelectedFiles(files);
    };

    return (
        <div className='all'>
            <Header/>

            <PageTitle/>

            <div className='DBWrapper'>
                <div className='Part1'>
                    <ExcelTypeList selectedProject={selectedProject} selectedFileType={selectedFileType}
                                   setSelectedProject={setSelectedProject} setSelectedFileType={setSelectedFileType}
                    />
                    <div
                        className='fileSelectionPart'
                        onClick={handleOnClick}
                    >
                        <img src='xls.png' className='xlsImage'/>
                        Select a XLS file to import
                    </div>
                    <input
                        type="file" // specify the type
                        ref={fileInput} // be used to manipulate the hidden tag
                        multiple='true' // allow multiple file selection
                        accept=".xls" // only accept xls
                        style={{display: "none"}} // hide this tag
                        onChange={handleSelectedFile}
                    />
                </div>

                <div className='Part2'>
                    <Upload
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        log={log}
                        setLog={setLog}
                        selectedProject={selectedProject}
                        selectedFileType={selectedFileType}
                    />
                    <Console log={log}/>
                </div>
            </div>

            <Footer/>

        </div>
    );
}

export default App;
