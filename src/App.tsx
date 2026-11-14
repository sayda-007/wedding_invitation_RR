import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { invitationData } from './data/invitationData'

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const sectionIds = [
  'cover',
  'couple',
  'event',
  'schedule',
  'countdown',
  'venue',
  'contacts',
  'closing',
] as const

type SectionId = (typeof sectionIds)[number]

const formatValue = (value: number) => (value < 10 ? `0${value}` : `${value}`)

const sparkIds = Array.from({ length: 18 }, (_, index) => index)

function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('cover')
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isEventReached, setIsEventReached] = useState(false)
  const openLockRef = useRef(false)
  const openTimerRef = useRef<number | null>(null)

  const openEnvelope = () => {
    if (openLockRef.current || isEnvelopeOpen || isOpening) {
      return
    }

    openLockRef.current = true
    setIsOpening(true)
    openTimerRef.current = window.setTimeout(() => {
      setIsEnvelopeOpen(true)
      setIsOpening(false)
    }, 1100)
  }

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(invitationData.eventDateTime)
      const diffInMs = targetDate.getTime() - Date.now()

      if (diffInMs <= 0) {
        setIsEventReached(true)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const totalSeconds = Math.floor(diffInMs / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      setIsEventReached(false)
      setCountdown({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isEnvelopeOpen) {
      return
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (!sections.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id as SectionId)
        }
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.6],
        rootMargin: '-15% 0px -50% 0px',
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [isEnvelopeOpen])

  const currentIndex = sectionIds.indexOf(activeSection)
  const isLastSection = currentIndex >= sectionIds.length - 1

  const scrollToSection = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const moveToNextSection = () => {
    if (isLastSection) {
      scrollToSection('cover')
      return
    }

    scrollToSection(sectionIds[currentIndex + 1])
  }

  const venueName = invitationData.venue.name
  const venueAddress = invitationData.venue.address
  const venueBengaliName = invitationData.venue.bengaliName

  return (
    <div className={`app-shell ${isEnvelopeOpen ? 'is-opened' : ''}`}>
      <AnimatePresence mode="wait">
        {!isEnvelopeOpen && (
          <motion.div
            key="sealed-card"
            className="envelope-stage"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <div className="envelope-wrapper">
              <motion.div
                className={`envelope ${isOpening ? 'is-opening' : ''}`}
                initial={{ scale: 0.98, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="envelope-texture" aria-hidden="true" />
                <div className="envelope-ornament envelope-ornament-right" aria-hidden="true" />
                <div className="envelope-shadow" aria-hidden="true" />

                <motion.div
                  className="envelope-panel left"
                  aria-hidden="true"
                  animate={isOpening ? { x: '-54%', rotateY: -72, rotateZ: -1.2 } : { x: 0, rotateY: 0, rotateZ: 0 }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="envelope-panel right"
                  aria-hidden="true"
                  animate={isOpening ? { x: '54%', rotateY: 72, rotateZ: 1.2 } : { x: 0, rotateY: 0, rotateZ: 0 }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                />

                <div className="envelope-inner" aria-hidden="true">
                  <div className="inner-frame">
                    <span className="inner-orbit" />
                    <span className="inner-monogram">{invitationData.monogram}</span>
                  </div>
                </div>

                <div className="light-burst" aria-hidden="true">
                  <span className="light-ray ray-1" />
                  <span className="light-ray ray-2" />
                  <span className="light-ray ray-3" />
                  <span className="light-ray ray-4" />
                  <span className="light-ray ray-5" />
                  <span className="light-ray ray-6" />
                  <span className="light-core" />
                </div>

                <div className="spark-field" aria-hidden="true">
                  {sparkIds.map((sparkId) => (
                    <span key={sparkId} className={`spark spark-${sparkId + 1}`} />
                  ))}
                </div>

                <div className="seal-cluster" aria-hidden="false">
                  <motion.button
                    type="button"
                    className={`wax-seal ${isOpening ? 'seal-released' : ''}`}
                    aria-label="Open the invitation"
                    onClick={openEnvelope}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  >
                    <span className="seal-rim" />
                    <span className="seal-rr">{invitationData.monogram}</span>
                    <span className="seal-glint" aria-hidden="true" />
                  </motion.button>

                  <motion.div
                    className="click-here"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    click here
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEnvelopeOpen && (
          <motion.main
            key="invitation-page"
            className="invitation-page"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="page-sparkles" aria-hidden="true">
              <span className="sparkle sparkle-1" />
              <span className="sparkle sparkle-2" />
              <span className="sparkle sparkle-3" />
              <span className="sparkle sparkle-4" />
              <span className="sparkle sparkle-5" />
              <span className="sparkle sparkle-6" />
            </div>

            <section id="cover" className="invitation-section cover-section">
              <div className="section-frame cover-frame">
                <div className="ornament ornament-top" aria-hidden="true" />

                <motion.p className="bismillah" dir="rtl" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </motion.p>
                <motion.p className="english-translation" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7, delay: 0.1 }}>
                  In the name of Allah, the Most Gracious, the Most Merciful.
                </motion.p>

                <motion.div className="welcome-header" initial={{ opacity: 0, y: 18, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.12 }}>
                  <div className="mini-knot">RR</div>
                  <span className="occasion-tag">WALIMA</span>
                </motion.div>

                <motion.p className="bangla-invite" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7, delay: 0.15 }}>
                  আপনাকে সাদর আমন্ত্রণ
                </motion.p>
                <motion.p className="welcome-message" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.2 }}>
                  With heartfelt joy and gratitude, we invite you to witness our Walima
                  celebration and share in the blessings of this new chapter.
                </motion.p>

                <div className="ornament ornament-bottom" aria-hidden="true" />
              </div>
            </section>

            <section id="couple" className="invitation-section couple-section">
              <div className="section-frame couple-frame">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  The Couple
                </motion.div>

                <div className="names-wrapper">
                  <div className="name-block groom-name">
                    <motion.span className="name-label" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: 0.08 }}>
                      Groom
                    </motion.span>
                    <motion.h2 className="animated-name" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7 }}>
                      <span>{invitationData.groom}</span>
                    </motion.h2>
                  </div>

                  <motion.div className="monogram-mark" aria-label="RR monogram" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.15 }}>
                    {invitationData.monogram}
                  </motion.div>

                  <div className="name-block bride-name">
                    <motion.span className="name-label" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: 0.12 }}>
                      Bride
                    </motion.span>
                    <motion.h2 className="animated-name" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: 0.1 }}>
                      <span>{invitationData.bride}</span>
                    </motion.h2>
                  </div>
                </div>
              </div>
            </section>

            <section id="event" className="invitation-section event-section">
              <div className="section-frame event-box">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  The Walima Celebration
                </motion.div>
                <div className="event-details">
                  <motion.p className="event-date" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.08 }}>
                    16 JANUARY 2027
                  </motion.p>
                  <motion.p className="event-day-banner" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.14 }}>
                    A gathering of family, love, and gratitude.
                  </motion.p>
                </div>
              </div>
            </section>

            <section id="schedule" className="invitation-section schedule-section">
              <div className="section-frame">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  Programme
                </motion.div>

                <div className="timeline">
                  <motion.div className="timeline-item" initial={{ opacity: 0, y: 18, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.08 }}>
                    <span className="time">1:00 PM</span>
                    <span className="dot" aria-hidden="true" />
                    <span className="label">Feast Begins</span>
                  </motion.div>
                </div>
              </div>
            </section>

            <section id="countdown" className="invitation-section countdown-section">
              <div className="section-frame countdown-box">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  Countdown
                </motion.div>

                {isEventReached ? (
                  <motion.p className="event-day-banner" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.08 }}>
                    The blessed day has arrived. We are grateful for your presence.
                  </motion.p>
                ) : (
                  <div className="countdown-grid" aria-label="Countdown to the Walima celebration">
                    {[
                      { value: countdown.days, label: 'Days' },
                      { value: countdown.hours, label: 'Hours' },
                      { value: countdown.minutes, label: 'Minutes' },
                      { value: countdown.seconds, label: 'Seconds' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="count-box"
                        initial={{ opacity: 0, y: 18, scale: 0.94 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.7, delay: index * 0.08 }}
                      >
                        <span className="value">{formatValue(item.value)}</span>
                        <span className="unit">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section id="venue" className="invitation-section venue-section">
              <div className="section-frame venue-box">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  Venue & Location
                </motion.div>

                <div className="venue-layout">
                  <motion.div className="venue-image-frame" initial={{ opacity: 0, y: 20, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.08 }}>
                    <img
                      src={invitationData.venue.image}
                      alt="Royal venue entrance gate photographed for the Walima invitation"
                    />
                  </motion.div>

                  <motion.div className="venue-copy" initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: 0.12 }}>
                    <div className="location-icon" aria-hidden="true">
                      ⌖
                    </div>
                    <h3 className="venue-name">{venueName}</h3>
                    <p className="venue-address">{venueAddress}</p>
                    <p className="venue-bengali-name">({venueBengaliName})</p>
                    <a
                      href={invitationData.venue.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="map-link"
                    >
                      Open in Google Maps
                    </a>
                  </motion.div>
                </div>
              </div>
            </section>

            <section id="contacts" className="invitation-section contacts-section">
              <div className="section-frame">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  Contact
                </motion.div>

                <div className="contact-list">
                  {invitationData.contacts.map((person, index) => (
                    <motion.a
                      key={person.phone}
                      href={`tel:${person.phone}`}
                      className="contact-item"
                      initial={{ opacity: 0, x: 18 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.7, delay: index * 0.08 }}
                    >
                      <span className="phone-icon" aria-hidden="true">
                        ☎
                      </span>
                      <div>
                        <strong>{person.name}</strong>
                        <span>{person.phone}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </section>

            <section id="closing" className="invitation-section closing-section">
              <div className="section-frame closing-box">
                <motion.div className="section-heading" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }}>
                  Dua
                </motion.div>

                <motion.p className="dua-text arabic" dir="rtl" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.08 }}>
                  بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                </motion.p>
                <motion.p className="dua-text english" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.12 }}>
                  May Allah bless you, shower His blessings upon you, and unite you both in goodness.
                </motion.p>
                <motion.p className="dua-bengali" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.16 }}>
                  আল্লাহ আপনাকে বরকত দান করুন, আপনার ওপর তাঁর বরকত নাজিল করুন এবং আপনাদের দুজনকে কল্যাণের সঙ্গে একত্রিত রাখুন।
                </motion.p>
                <motion.p className="dua-reference" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.2 }}>
                  Jami' at-Tirmidhi 1091
                </motion.p>

                <motion.div className="closing-ornament" aria-hidden="true" initial={{ opacity: 0, scaleX: 0.7 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.2 }} />

                <motion.p className="final-message" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.24 }}>
                  Your presence will make our joy complete. Insha’Allah.
                </motion.p>
                <motion.p className="final-message bangla" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.28 }}>
                  আপনাদের উপস্থিতি আমাদের আনন্দকে পূর্ণতা দেবে, ইনশাআল্লাহ।
                </motion.p>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      {isEnvelopeOpen && (
        <button
          type="button"
          className="bottom-nav"
          aria-label={isLastSection ? 'Return to the top' : 'Scroll to the next section'}
          onClick={moveToNextSection}
        >
          {isLastSection ? '↑' : '↓'}
        </button>
      )}
    </div>
  )
}

export default App
