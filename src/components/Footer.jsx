import { APP_LOGO } from "../lib/matching.js";

const LEGAL_DOCUMENT = "https://docs.google.com/document/d/1iPDo_vBVSMdnTfB3dnlG4eFyB2uqAIIoZKNbqnhr6T0/edit";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-identity">
          <img src={APP_LOGO} alt="" />
          <div>
            <strong>CUB</strong>
            <span>Canine Understanding Buddy</span>
          </div>
        </div>

        <div className="footer-column">
          <h2>Contact</h2>
          <a href="mailto:proj4paws@gmail.com">proj4paws@gmail.com</a>
          <a href="https://www.instagram.com/meetmycub/" target="_blank" rel="noreferrer noopener">
            Instagram @meetmycub
          </a>
        </div>

        <div className="footer-column">
          <h2>Legal</h2>
          <a href={`${LEGAL_DOCUMENT}?tab=t.0`} target="_blank" rel="noreferrer noopener">
            Privacy Policy
          </a>
          <a href={`${LEGAL_DOCUMENT}?tab=t.qk5vh67ug3c`} target="_blank" rel="noreferrer noopener">
            Terms &amp; Conditions
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} CUB</span>
        <span>Thoughtful matches for dogs and people.</span>
      </div>
    </footer>
  );
}
