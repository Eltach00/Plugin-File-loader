import InpuFile from "./upload"
import './style.css'

const upload = new InpuFile('file', {
    multiple: true,
    accept: ['.jpg', '.png', '.gif', '.jpeg']
})

upload.render()