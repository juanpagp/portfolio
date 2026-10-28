import { useEffect, useMemo, useState } from "react";
import en from "./locales/en.json";
import es from "./locales/es.json";
import esUi from "./locales/ui-es.json";
import enUi from "./locales/ui-en.json";


const translations = {
  en: { ...en, ui: { ...enUi, ...(en.ui ?? {}) } },
  es: { ...es, ui: { ...esUi, ...(es.ui ?? {}) } },
};
const supportedLanguages = Object.keys(translations);
const GITHUB_PROFILE = "https://github.com/juanpagp";
const LANGUAGE_STORAGE_KEY = "juanpa-language";

function detectBrowserLanguage() {
  const preferences = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean);

  // Respect the browser's ordered language preferences and choose the first language supported here.
  for (const preference of preferences) {
    const baseLanguage = String(preference).toLowerCase().split(/[-_]/)[0];
    if (supportedLanguages.includes(baseLanguage)) return baseLanguage;
  }
  return "en";
}

function getInitialLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (supportedLanguages.includes(saved)) return saved;
  } catch {
    // Storage can be disabled; browser language detection still works.
  }
  return detectBrowserLanguage();
}

function SectionHeading({ id, title, subtitle }) {
  return (
    <div className="sh">
      <h2 id={`${id}-heading`}>{title}</h2>
      {subtitle ? <span>{subtitle}</span> : null}
    </div>
  );
}

function Tags({ items, label }) {
  return (
    <ul className="tags" aria-label={label}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function descriptionParts(description) {
  const match = description.match(/^(.+?\.)\s+([\s\S]+)$/);
  return match ? { lead: match[1], remainder: match[2] } : { lead: description, remainder: "" };
}

function statusSymbol(status) {
  if (/development|desarrollo/i.test(status)) return "◐";
  if (/completed|completado/i.test(status)) return "●";
  return "○";
}

function repositoryLabel(url) {
  if (!url || url === "NotPublic") return "";
  return url.replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");
}

function RepositoryLink({ project, text }) {
  if (!project.link || project.link === "NotPublic") return null;
  return (
    <p className="repo-line">
      <a className="lnk" href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`${text}: ${repositoryLabel(project.link)}`}>
        {repositoryLabel(project.link) || text} ↗
      </a>
    </p>
  );
}

function PrivateNotice({ t }) {
  return (
    <p className="priv">
      <b>{t.notPublic.title.toLocaleUpperCase()}</b>
      {t.notPublic.message}
    </p>
  );
}

function ProjectDetails({ project, t }) {
  return (
    <details>
      <summary>{t.ui.moreDetails}</summary>
      <p>{project.description}</p>
    </details>
  );
}

function ProjectCard({ project, t }) {
  return (
    <article>
      <span className="st">{statusSymbol(project.status)} {project.status}</span>
      <h3 className="project-name">{project.name}</h3>
      <p>{project.description}</p>
      <ProjectDetails project={project} t={t} />
      <Tags items={project.skills} label={`${project.name} ${t.ui.projectTechnologies}`} />
      {project.link === "NotPublic" ? <PrivateNotice t={t} /> : <RepositoryLink project={project} text={t.ui.viewSource} />}
    </article>
  );
}

function ProjectRow({ project, index, t }) {
  return (
    <article>
      <span className="n" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3 className="project-name">{project.name}</h3>
        <div className="st">{statusSymbol(project.status)} {project.status}</div>
      </div>
      <div>
        <p>{project.description}</p>
        <ProjectDetails project={project} t={t} />
        {project.link === "NotPublic" ? <PrivateNotice t={t} /> : null}
      </div>
      <div>
        <Tags items={project.skills} label={`${project.name} ${t.ui.projectTechnologies}`} />
        {project.link !== "NotPublic" ? <RepositoryLink project={project} text={t.ui.viewSource} /> : null}
      </div>
    </article>
  );
}

function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const t = translations[language];

  const { featuredProject, personalProjects, professionalProjects } = useMemo(() => {
    const featured = t.projects.items.find((project) => project.name === "Nebula") ?? t.projects.items[0];
    const rest = t.projects.items.filter((project) => project !== featured);
    return {
      featuredProject: featured,
      personalProjects: rest.filter((project) => project.category === "Personal"),
      professionalProjects: rest.filter((project) => project.category !== "Personal"),
    };
  }, [t, language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.site.seoTitle;

    const setMeta = (selector, content) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        const attribute = selector.includes("property=") ? "property" : "name";
        const match = selector.match(/(?:name|property)=["']?([^"'\]]+)/);
        if (match) element.setAttribute(attribute, match[1]);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', t.site.seoDescription);
    setMeta('meta[name="keywords"]', t.site.keywords);
    setMeta('meta[property="og:title"]', t.site.ogTitle);
    setMeta('meta[property="og:description"]', t.site.ogDescription);
    setMeta('meta[property="og:locale"]', language === "es" ? "es_ES" : "en_GB");
  }, [language, t]);

  function changeLanguage(nextLanguage) {
    if (!supportedLanguages.includes(nextLanguage)) return;
    setLanguage(nextLanguage);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // Language switching still works for this page view if storage is unavailable.
    }
  }

  const featuredDescription = descriptionParts(featuredProject.description);
  const firstPersonalProjects = personalProjects.slice(0, 2);
  const remainingPersonalProjects = personalProjects.slice(2);

  return (
    <>
      <a className="skip" href="#main">{t.ui.skipToContent}</a>
      <header>
        <div className="wrap bar">
          <a className="brand" href="#top" aria-label={t.ui.home}>juanpa<i>@arch</i> ~/dev $</a>
          <nav aria-label={t.ui.navLabel}>
            <ul>
              <li><a href="#projects">{t.nav.projects}</a></li>
              <li><a href="#about">{t.nav.about}</a></li>
              <li><a href="#skills">{t.nav.skills}</a></li>
              <li><a href="#experience">{t.nav.experience}</a></li>
              <li><a href="#education">{t.nav.education}</a></li>
              <li><a href="#contact">{t.nav.contact}</a></li>
            </ul>
          </nav>
          <div className="lang" role="group" aria-label={t.ui.languageLabel}>
            <button type="button" onClick={() => changeLanguage("en")} aria-pressed={language === "en"}>EN</button>
            <button type="button" onClick={() => changeLanguage("es")} aria-pressed={language === "es"}>ES</button>
          </div>
        </div>
      </header>

      <main id="main">
        <div className="wrap">
          <div id="top" className="hero">
            <div>
              <p className="prompt"><b>juanpa@arch</b> ~/dev $ {t.hero.greeting} {t.hero.greeting_emoji}</p>
              <h1>{t.hero.title}</h1>
              <p className="lede"><strong>{t.hero.intro} {t.site.name}.</strong> {t.site.seoDescription}</p>
              <div className="cta">
                <a className="btn p" href="#projects">{t.nav.projects} →</a>
                <a className="btn s" href="#contact">{t.nav.contact}</a>
              </div>
            </div>
            <div>
              <p className="sys-t">{t.ui.profileTitle}</p>
              <dl className="sys">
                <div><dt>{t.ui.role}</dt><dd>{t.ui.profileRole}</dd></div>
                <div><dt>{t.ui.location}</dt><dd>{t.ui.profileLocation}</dd></div>
                <div><dt>{t.ui.focus}</dt><dd>{t.ui.profileFocus}</dd></div>
                <div><dt>{t.ui.languages}</dt><dd>{t.ui.profileLanguages}</dd></div>
              </dl>
            </div>
          </div>

          <section id="projects" aria-labelledby="projects-heading">
            <SectionHeading id="projects" title={t.projects.title} subtitle={t.ui.selectedWork} />
            <article className="feat">
              <div>
                <span className="st">{statusSymbol(featuredProject.status)} {featuredProject.status}</span>
                <h3>{featuredProject.name}</h3>
                <p className="tag">{featuredDescription.lead}</p>
                <p>{featuredDescription.remainder}</p>
                <Tags items={featuredProject.skills} label={`${featuredProject.name} technologies`} />
                <RepositoryLink project={featuredProject} text={t.ui.viewSource} />
              </div>
              <div style={{ alignSelf: "end" }}>
                <p className="goals-t">{t.ui.projectMetaTitle}</p>
                <dl className="goals">
                  <div><dt>{t.ui.projectCategory}</dt><dd>{featuredProject.category}</dd></div>
                  <div><dt>{t.ui.projectStatus}</dt><dd>{featuredProject.status}</dd></div>
                  <div><dt>{t.ui.technologies}</dt><dd>{featuredProject.skills.join(" · ")}</dd></div>
                </dl>
              </div>
            </article>

            <div className="two">
              {firstPersonalProjects.map((project) => <ProjectCard key={project.name} project={project} t={t} />)}
            </div>

            <p className="group">{t.ui.personalWork}</p>
            <div className="rows">
              {remainingPersonalProjects.map((project, index) => <ProjectRow key={project.name} project={project} index={index} t={t} />)}
            </div>

            <p className="group">{t.ui.professionalWork}</p>
            <div className="rows">
              {professionalProjects.map((project, index) => <ProjectRow key={project.name} project={project} index={index} t={t} />)}
            </div>
          </section>

          <section id="about" aria-labelledby="about-heading">
            <SectionHeading id="about" title={t.about.title} subtitle="about.md" />
            <div className="about">
              <p className="big">{t.site.description}</p>
              <div><p>{t.about.bio}</p></div>
            </div>
          </section>

          <section id="skills" aria-labelledby="skills-heading">
            <SectionHeading id="skills" title={t.skills_title} subtitle="skills.log" />
            <dl className="skills">
              {t.skills.map((skill) => (
                <div key={skill.name}>
                  <dt>{skill.name}</dt>
                  <dd><small>{skill.experienceYears.replace(/^\s*·\s*/, "")}</small></dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="experience" aria-labelledby="experience-heading">
            <SectionHeading id="experience" title={t.experience.title} subtitle="experience.log" />
            {t.experience.items.map((job) => (
              <article className="job" key={`${job.company}-${job.title}`}>
                <time>{job.dateRange}</time>
                <div>
                  <h3>{job.title}</h3>
                  <p className="org">{job.company}</p>
                  <ul>{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                </div>
              </article>
            ))}
          </section>

          <section id="education" aria-labelledby="education-heading">
            <SectionHeading id="education" title={t.education.title} subtitle="education.log" />
            <div className="edu">
              {t.education.items.map((item) => (
                <article key={`${item.school}-${item.degree}`}>
                  <time className="st" style={{ color: "var(--mute)" }}>{item.dateRange}</time>
                  <h3>{item.degree}</h3>
                  <p className="org">{item.school}</p>
                  <ul>{item.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
                </article>
              ))}
            </div>
          </section>

          <section id="contact" className="contact" aria-labelledby="contact-section-heading">
            <SectionHeading id="contact-section" title="contact.sh" subtitle={t.nav.contact.toLowerCase()} />
            <h2 id="contact-heading" className="big">{t.ui.contactTitle}</h2>
            <p>{t.ui.contactText}</p>
            <div className="links">
              <a className="btn p" href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">{t.ui.githubProfile} ↗</a>
            </div>
          </section>

          <footer>
            <span><b>juanpa@arch</b> ~/dev $ exit </span>
            <span>© {new Date().getFullYear()} {t.site.name}. {t.footer.copyright}</span>
            <a href="#top" className="lnk">{t.ui.top}</a>
          </footer>
        </div>
      </main>
    </>
  );
}

export default App;
