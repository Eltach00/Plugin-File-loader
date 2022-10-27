import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {initializeApp} from 'firebase/app'

const firebaseConfig = {
    apiKey: "AIzaSyBKM7DnCZFngWutnjW6cb6rfFk_vr18wCM",
    authDomain: "fronted-upload.firebaseapp.com",
    projectId: "fronted-upload",
    storageBucket: "fronted-upload.appspot.com",
    messagingSenderId: "248608428900",
    appId: "1:248608428900:web:7ebb63f84d5647fd962071"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage()


function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default class InpuFile {
    open
    uplaod
    preview
    files

    constructor(id, options = {}) {
        this.input = document.getElementById(id)
        this.options = options
        
    }
    
    render() {
        this.open = this.createElem('button', ['btn'], 'Open')
        this.uplaod = this.createElem('button', ['btn', 'primary'], 'Upload')
        this.preview = this.createElem('div', ['preview'])


        this.input.after(this.open)
        this.open.after(this.preview)
        this.open.after(this.uplaod)
        this.uplaod.style.display = 'none'
        this.inputOptions()
        this.initEvents()
    }

    

    inputOptions() {
        if (this.options.multiple) {
            this.input.setAttribute('multiple', true)
        }

        if (this.options.accept && Array.isArray(this.options.accept)) {
            this.input.setAttribute('accept', this.options.accept.join(', '))
        }
    }

    initEvents() {
        this.open.addEventListener('click', this.triggerInput)  
        this.input.addEventListener('change', this.onChangeHandler) 
        document.addEventListener('click', this.closeEvent) 
        this.uplaod.addEventListener('click', this.onUploadHandler)
    }

    onUploadHandler = event => {
        this.preview.querySelectorAll('.image-remover').forEach( item => item.remove())
        const imagesInfo = this.preview.querySelectorAll('.image-info')
        imagesInfo.forEach( item => {
            item.style.bottom = '5px'
            item.innerHTML = `<div class='inProgress'></div>`
        })
        this.files.forEach( (file, index) => {
            const storageRef = ref(storage, `images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%'
                    const progressElem = imagesInfo[index].querySelector('.inProgress')
                    progressElem.style.width = progress
                    progressElem.textContent = progress
                    if (snapshot.state === ' pause') {
                        console.log('Upload is paused');
                    }
                }, 
                (error) => {
                   console.log(error) // Handle unsuccessful uploads
                }, 
                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log(`${file.name} available at`, downloadURL);
                    });
                }
                );

        })
    }

    closeEvent = event => {
        if (event.target.closest('.image-remover')) {
            event.target.parentElement.classList.add('removing')
            setTimeout(() => {
                event.target.parentElement.remove()
            }, 300);
            this.files = this.files.filter(item => item.name !== event.target.nextElementSibling.alt)
            if (!this.files.length) {
                 this.uplaod.style.display = 'none'  
            }
        }
    }

    onChangeHandler = event => {
        if (!event.target.files.length) {
            return
        }

        this.files = [...event.target.files]
        this.preview.innerHTML = ``
        this.uplaod.style.display = ''

        this.files.forEach( this.addImg )

    }

    addImg = file => {
            if (!file.type.match('image')) {
                return
            }
            const reader = new FileReader() 
            reader.onload = ev => {
                const div = document.createElement('div')
                div.classList.add('preview-image')
                div.innerHTML = `<div class='image-remover'>&times</div>
                <img src='${ev.target.result}' alt='${file.name}' />
                <div class='image-info'>
                <span>${file.name}</span>
                <span>${formatBytes(file.size, 1)}</span>
                </div>
                `
                this.preview.append(div)
           
            }
            reader.readAsDataURL(file)
    }

    triggerInput = () => {
        this.input.click()
    }

    createElem( tag = '', classForElem = [], content = '') {
        const node = document.createElement(tag)
        if (classForElem) {
            node.classList.add(...classForElem)
        }
        if (content) {
            node.textContent = content
        }
        return node
    }

 
}