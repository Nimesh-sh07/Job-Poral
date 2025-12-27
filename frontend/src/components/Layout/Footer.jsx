import "./Footer.css";
import React, { useContext } from 'react'
import {Context} from "../../main"
import {Link} from "react-router-dom"
import { FaGithub , FaLinkedin} from "react-icons/fa"
import { SiLeetcode } from "react-icons/si";
import { RiInstagramFill} from "react-icons/ri"
function Footer() {
  const {isAuthorized}  = useContext(Context)
  return (
    <footer className= {isAuthorized ? "footerShow" : "footerHide"}>
<div>&copy; All Rights Reserved by Nimesh.</div>
<div>
<a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
<a href="https://leetcode.com/yourusername" target="_blank" rel="noopener noreferrer"><SiLeetcode /></a>
<a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
<a href="https://instagram.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><RiInstagramFill /></a>

</div>
    </footer>
  )
}

export default Footer