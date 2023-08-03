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
        ['Visualizer', ['Course Info', 'Sequence', 'Course Category', 'Graduate Attributes']],
        ['Scheduler', ['Course Info', 'Accreditation Units']],
    ])

    const programList = ['Petroleum', 'Mining', 'Mechatronics', 'MECE', 'Materials', 'Engg Physics', 'Electrical', 'Computer', 'Civil', 'Chemical'];

    const handleOnChange = (projectType) => {
        if (projectType !== props.selectedProject) {
            props.setSelectedProject(projectType);
        }
    }

    const handleFileOnChange = (fileType) => {
        props.setSelectedFileType(fileType);
    }

    const handleProgramOnChange = (program) => {
        props.setSelectedProgram(program);
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
        return (
            <div className='subType'>
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

    useEffect(() => {
        if (props.selectedFileType === 'Sequence') {
            props.setSelectedProgram(programList[0]);
        }
    }, [props.selectedFileType])

    let programsDiv;
    if (props.selectedFileType === 'Sequence') {

        const programDivs = programList.map((program) => {
            const isSelected = program === props.selectedProgram;
            return (
                <div className='subtypeVisualizer'>
                    <input
                        type='radio'
                        name='subProgramType'
                        checked={isSelected}
                        onChange={() => handleProgramOnChange(program)}
                    />
                    <span className='subTypeName'>{program}</span>
                </div>
            )
        })

        programsDiv = (
            <div className='fileTypesVisualizer'>
                {programDivs}
            </div>
        )
    } else {
        programsDiv = null;
    }

    return (
        <div className='excelTypeList'>
            <div className='selectionDescription'>
                SELECT FILE TYPE
            </div>
            <div className='radioPart'>
                <div className='projectTypes'>
                    {types}
                </div>
                <div className='fileTypes'>
                    {subTypes}
                </div>
                {programsDiv && (
                    <div>
                        {programsDiv}
                    </div>
                )}
            </div>
        </div>
    )
}

const Upload = (props) => {

    const [selectedTags, setSelectedTags] = useState([]);

    const selectedFiles = props.selectedFiles;
    const selectedProject = props.selectedProject;
    const selectedFileType = props.selectedFileType;
    const selectedProgram = props.selectedProgram;

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

    // handle the data import http request
    const handleHttpRequest = (url, formData) => {
        const generalUrl = "/nobes/timetable/core";

        // 获取所有文件
        const allFiles = [...props.selectedFiles];
        let uploadedFiles = []; // store uploaded files

        // get file name from formData
        for (let pair of formData.entries()) {
            if (pair[0] === 'file') {
                uploadedFiles.push(pair[1].name);
            }
        }

        // 添加 Loading... 到 log
        const loadingLog = [...props.log];
        loadingLog.push("Updating...");
        props.setLog(loadingLog);

        axios.post(`${generalUrl}${url}`, formData)
            .then(response => {
                const message = response.data.obj;
                const log = loadingLog;
                log.push(message);
                log.push("---------------------------------------------------------------------------------------------------------------------------------");
                props.setLog(log);

                // remove uploaded files
                const remainingFiles = allFiles.filter(file => !uploadedFiles.includes(file.name));
                props.setSelectedFiles(remainingFiles);
            })
            .catch(error => {
                const errorMessage = "Error fetching data: " + error;
                const updatedLog = [...props.log, errorMessage, "---------------------------------------------------------------------------------------------------------------------------------"];
                props.setLog(updatedLog);
            });
    };


    const handleFileUpload = (project, fileType, formData, program) => {
        if (project === 'Visualizer') {
            // visualizer sequence import
            if (fileType === 'Sequence') {
                formData.append('program', program);
                handleHttpRequest('/sequenceImport', formData);
            } else if (fileType === 'Course Info') {
                handleHttpRequest('/visualizerCourseImport', formData);
            } else if (fileType === 'Course Category') {
                handleHttpRequest('/visualizerGroupImport', formData);
            } else {
                return null;
            }
        } else if (project === 'Scheduler') {
            // scheduler course info import
            if (fileType === 'Course Info') {
                handleHttpRequest('/timeTableImport', formData);
            } else {
                handleHttpRequest('/auImport', formData);
            }
        } else {
            return null;
        }
    }

    const handleUploadOnClick = (project, fileType, files, selectedTags, program) => {
        const formData = new FormData();
        let isNull = true;
        for (let i = 0; i < files.length; i++) {
            if (selectedTags.includes(files[i].name)) {
                formData.append('file', files[i]);
                isNull = false;
            }
        }

        if (!isNull) {
            handleFileUpload(project, fileType, formData, program);
        } else {
            const newLog = [...props.log];
            newLog.push("Select a file to upload");
            newLog.push("---------------------------------------------------------------------------------------------------------------------------------");
            props.setLog(newLog);
        }

        setSelectedTags([]);
    }

    const handleUploadAllOnClick = (project, fileType, files, program) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        handleFileUpload(project, fileType, formData, program);
        setSelectedTags([]);
    }

    const handleDeleteHttpRequest = (url) => {
        const generalUrl = "/nobes/timetable/core";
        axios.get(`${generalUrl}${url}`)
            .then(response => {
                const log = [...props.log];
                log.push("Truncate complete");
                log.push("---------------------------------------------------------------------------------------------------------------------------------");
                props.setLog(log);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    const handleTruncateClick = (project, fileType) => {
        if (project === 'Visualizer') {
            // visualizer sequence import
            if (fileType === 'Sequence') {
                handleDeleteHttpRequest('/truncateSequence');
            } else if (fileType === 'Course Info') {
                handleDeleteHttpRequest('/truncateVisualizer');
            } else if (fileType === 'Course Category') {
                handleDeleteHttpRequest('/truncateCourseGroup');
            } else {
                return null;
            }
        } else if (project === 'Scheduler') {
            // scheduler course info import
            if (fileType === 'Course Info') {
                handleDeleteHttpRequest('/truncateTimetable');
            } else {
                handleDeleteHttpRequest('/truncateAU');
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
                        onClick={() => handleUploadOnClick(selectedProject, selectedFileType, selectedFiles, selectedTags, selectedProgram)}>Upload
                </button>
                <button className='button'
                        onClick={() => handleUploadAllOnClick(selectedProject, selectedFileType, selectedFiles, selectedProgram)}>Upload
                    All
                </button>
                <button className='button'
                        onClick={() => handleTruncateClick(selectedProject, selectedFileType)}>Truncate
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
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [props.log]);

    return (
        <div className='consoleWindow'>
            {logs}
            <div ref={endRef} />
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
    const [selectedProgram, setSelectedProgram] = useState(null);

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
                                   selectedProgram={selectedProgram}
                                   setSelectedProject={setSelectedProject} setSelectedFileType={setSelectedFileType}
                                   setSelectedProgram={setSelectedProgram}/>

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
                        selectedProgram={selectedProgram}
                    />
                    <Console log={log}/>
                </div>
            </div>

            <Footer/>

        </div>
    );
}

export default App;
