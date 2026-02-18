const PROJECT_IMAGES = [
  '/project-thumb-1.png',
  '/project-thumb-2.png',
  '/project-thumb-3.png',
  '/project-thumb-4.png',
];

const KEYWORDS = ['Sound Design', 'Menacing', 'Ponderous/Heavy', 'Ponderous/Heavy', 'Aggressive', 'Flowing'];

function ProjectCard({ soundsLikePanelOpen, onSoundsLikeClick }) {
  return (
    <div className="project-card">
      <div className="project-visuals">
        <div className="image-grid single">
          {PROJECT_IMAGES.map((src, i) => (
            <img key={i} className="grid-img" src={src} alt="" />
          ))}
        </div>
      </div>
      <div className="project-details">
        <div className="project-content-row">
          <div className="project-text-block">
            <div className="project-actions project-actions-inline">
              <img src="/Actions.svg" alt="Project actions" className="project-actions-icons" />
            </div>
            <div className="project-description">
              <p>Duis nibh posuere elit ultrices. Nibh et id elementum et dolor leo. Sit lacus in purus orci. Egestas massa, tincidunt scelerisque lorem. Lacus vitae commodo in vulputate fusce placerat. Sapien quis id ut mattis mattis pharetra, vitae tristique sed.</p>
            </div>
            <div className="keywords">
              {KEYWORDS.map((kw, i) => (
                <span key={i} className="keyword">
                  {kw} <button type="button" className="remove">×</button>
                </span>
              ))}
              <button type="button" className="add-keyword">+ Add Keyword</button>
            </div>
          </div>
          {!soundsLikePanelOpen && (
            <div className="sounds-like-box">
              <p>Find tracks that sound like this project</p>
              <button type="button" className="btn-sounds-like" onClick={onSoundsLikeClick}>
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.73242 1.26757C8.1425 1.24947 8.49219 1.62908 8.49219 2.02734V2.0459C8.50405 2.50778 8.49219 2.97363 8.49219 3.43847V13.4394C8.49219 13.865 8.1425 14.1816 7.73242 14.2002C7.32214 14.2186 6.97168 13.8379 6.97168 13.4394V13.4219C6.95981 12.96 6.97168 12.4941 6.97168 12.0293L6.97168 2.02734C6.97168 1.60162 7.32214 1.28539 7.73242 1.26757ZM4.83594 3.11035C5.24618 3.09199 5.5957 3.47173 5.5957 3.87011L5.5957 11.334C5.59544 11.7594 5.24603 12.0753 4.83594 12.0937C4.42582 12.1121 4.07645 11.7322 4.07617 11.334V3.87011C4.07617 3.44143 4.42566 3.12816 4.83594 3.11035ZM10.3643 3.11035C10.7744 3.09216 11.124 3.47182 11.124 3.87011V11.334C11.1238 11.7593 10.7742 12.0752 10.3643 12.0937C9.95414 12.1121 9.6038 11.7322 9.60352 11.334V3.87011C9.60352 3.44143 9.95398 3.12816 10.3643 3.11035ZM1.99707 4.39257C2.40726 4.37423 2.75675 4.75402 2.75684 5.15234L2.75684 10.0508C2.75662 10.4763 2.40718 10.7921 1.99707 10.8105C1.58693 10.8289 1.23754 10.449 1.2373 10.0508L1.2373 5.15234C1.23739 4.72729 1.58386 4.41098 1.99707 4.39257ZM13.2012 4.39257C13.6114 4.37417 13.9618 4.75399 13.9619 5.15234V10.0508C13.9617 10.4763 13.6113 10.7921 13.2012 10.8105C12.7912 10.8287 12.4416 10.4489 12.4414 10.0508V5.15234C12.4415 4.72742 12.7911 4.41115 13.2012 4.39257Z"/></svg>
                Sounds like
              </button>
            </div>
          )}
        </div>
        <div className="metadata">
          Created by <span className="metadata-value">Matthew For Netflix</span> Created on <span className="metadata-value">1/5/22</span> Last updated <span className="metadata-value">8/2/22</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
