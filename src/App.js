import './App.css';
import {useEffect, useRef, useState} from "react";
import axios from "axios";


/**
 * header component: use to display the logo and project name
 * */
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

/**
 * TabHeader component: used to switch between import and help page
 * */
const TabHeader = (props) => {

    const tabButtons = props.tabs.map((tab, index) => {

        const className = index === 0 ? 'tabButton1' : 'tabButton';

        return (
            <div
                className={className}
                onClick={() => {
                    props.setTab(index);
                }}
                style={{
                    borderBottom: index === props.tabIndex ? '2px solid' : 'none',
                }}
            >
                {tab}
            </div>
        )
    });

    return (
        <div className='tabWrapper'>
            {tabButtons}
        </div>
    )
}

/**
 * PageTitle component: use to display the page title
 * */
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

/**
 * HelpPageTitle component: use to display the help page title
 * */
const HelpPageTitle = () => {
    return (
        <div style={{
            margin: "25px auto 40px auto",
            color: "#275d38",
            fontSize: "53px",
            fontFamily: "'Roboto', sans-serif",
            fontWeight: "300"
        }}>
            Instruction
        </div>
    );
}


/**
 * Component used to select the file type of the import files
 * */
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

    /**
     * Two main types: Visualizer and Scheduler
     * */
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


    /**
     * Subtypes of Visualizer and Scheduler
     * */
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

/**
 * Upload and delete files component
 * */
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
                log.push(filetype + " data upload is complete");
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

        // remove uploaded files after upload finished
        const remainingFiles = allFiles.filter(file => !uploadedFiles.includes(file.name));
        props.setSelectedFiles(remainingFiles);
    }

    /**
     * upload all the files
     * */
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

/**
 * Component used to display the operation results
 * */
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

const Instruction = () => {

    return (
        <div className='instructionContent'>
            <b className='Part1Title'>Part 1: Visualizer Data Import</b>
            <div className='roughDescription'>The following example will demonstrate how to update the data of the visualizer for the upcoming year.</div>
            <div className='steps'>Step One: Delete the old data</div>
            <div>Open the database import tool, select the visualizer option and click on delete button (The deletion feature doesn't require selecting a specific program.)</div>
            <img alt="delete" src="img.png" className="helpImage"/>
            <div>The deletion is complete when the information below is displayed in the console.</div>
            <img alt="delete" src="img_1.png" className="deleteConsoleImage"/>

            <div className='steps'>Step Two: Delete the old data</div>
            <div>Inside the 'NOBES_W2023_COOP/Program_Visualizer/Website Excel Files', download one of these folders.</div>
            <img alt="folder" src="folder.png" className="helpImage"/>
            <div>Unzip the zip files and check:<div className='notice'>1. All files are in xls format. 2. There are a total of three types of files, one for each: course info, course category, and sequence.</div>
            Select visualizer and the same program as subtype, and then select these 3 files
            </div>
            <img alt="selection" src="img_3.png" className="helpImage"/>
            <div>Select the file you want to upload and click 'Upload,' or directly click 'Upload All' to upload all files. (See selected files information in console window)</div>
            <img alt="selection" src="img_2.png" className="helpImage"/>
            <div>The data import is complete when the information below is displayed in the console.</div>
            <img alt="delete" src="img_4.png" className="deleteConsoleImage"/>
            <div className='lastStep'>Repeat Step Two for the rest of the programs</div>

            <b className='Part1Title'>Part 2: Scheduler Data Import</b>
            <div className='roughDescription'>The following example will demonstrate how to update the data of the scheduler for the upcoming year.</div>
            <div className='steps'>Scheduler Course Information Data import:</div>
            <div>Delete old data: Open the database import tool, <span style={{ color: 'red' }}>select the scheduler, course Info</span> and click on delete button (Same process as Part 1: Step One)</div>
            <div>Inside the 'NOBES_W2023_COOP/Program_Visualizer/TIMETABLES' folder, there are several subfolders, each representing a faculty. Download all the Excel files from each of these subfolders. <span style={{ color: 'red',  fontWeight: '500'}}>(All the files need to be in .xls)</span></div>
            <img alt="selection" src="img_5.png" className="helpImage"/>
            <div>Select scheduler and course Info as subtype, then select all the files you downloaded</div>
            <img alt="selection" src="img_7.png" className="helpImage"/>
            <div>Select the file you want to upload and click 'Upload,' or directly click 'Upload All' to upload all files. (See selected files information in console window)</div>
            <img alt="selection" src="img_8.png" className="helpImage"/>
            <div>The data import is complete when successful information is displayed in the console. </div>

            <div className='LASTstep'>Scheduler Accreditation Units Data import:</div>
            <div>Delete old data: Open the database import tool, <span style={{ color: 'red' }}>select the scheduler, course Info</span> and click on delete button (Same process as Part 1: Step One)</div>
            <div>Inside the 'NOBES_W2023_COOP/Program_Visualizer/Website Excel Files' folder, download AU_Count.xls. <span style={{ color: 'red',  fontWeight: '500'}}>(Make sure it is in .xls)</span></div>
            <img alt="selection" src="img_9.png" className="helpImage"/>
            <div>Select scheduler and Accreditation Units as subtype, then select the AU file you downloaded</div>
            <img alt="selection" src="img_10.png" className="helpImage"/>
            <div>Click 'Upload,' or 'Upload All' to upload that file.</div>
            <div>The data import is complete when successful information is displayed in the console.</div>
        </div>
    )
}


/**
 * footer component
 * */
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
    const tabs = ['Import', 'Help'];
    const [tabIndex, setTabIndex] = useState(0);

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

            <div className='tabHeader' >
                <TabHeader tabs={tabs}
                           tabIndex={tabIndex}
                           setTab={setTabIndex}
                />
            </div>

            {tabIndex === 0 && (
                <div>
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

                </div>
            )}

            {tabIndex === 1 && (
                <div className='helpInstruction'>
                    <HelpPageTitle />

                    <Instruction />
                </div>
            )}

            <Footer/>

        </div>
    );
}

export default App;
