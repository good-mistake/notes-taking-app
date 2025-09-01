import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  Variants,
} from "framer-motion";
import { NoteTypes } from "../utils/types";
import {
  addNote,
  addGuestNote,
  updateGuestNote,
  updateNote,
  deleteGuestNote,
  deleteNote,
  selectVisibleNotes,
} from "../redux/noteSlice";
import { useWindowSize } from "./useWindowSize";
import {
  selectNotesState,
  setFilter,
  setSearchQuery,
} from "../redux/noteSlice";
import Footer from "./Footer";
import Search from "./Search";
import Nav from "./Nav";
import {
  setSelectedNote,
  setView,
  closeSearch,
  clearSelection,
} from "../redux/viewSlice";
import { RootState } from "../redux/store";
const Notes = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const notes = useAppSelector(selectVisibleNotes);
  const prefersReducedMotion = useReducedMotion();
  const [draftNote, setDraftNote] = useState<NoteTypes | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [archiveModal, setArchiveModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isTablet } = useWindowSize();
  const { filter, searchQuery, showSettings } =
    useAppSelector(selectNotesState);
  const view = useAppSelector((s: RootState) => s.view.view);
  const selectedNoteId = useAppSelector(
    (s: RootState) => s.view.selectedNoteId
  );

  const deleteRef = useRef<HTMLOptionElement | null>(null);
  const archiveRef = useRef<HTMLOptionElement | null>(null);

  useEffect(() => {
    if (!deleteModal) return;
    const onDocDown = (e: MouseEvent) => {
      if (deleteRef.current && !deleteRef.current.contains(e.target as Node))
        setDeleteModal(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteModal(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [deleteModal]);

  useEffect(() => {
    if (!archiveModal) return;
    const onDocDown = (e: MouseEvent) => {
      if (archiveRef.current && !archiveRef.current.contains(e.target as Node))
        setArchiveModal(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArchiveModal(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [archiveModal]);
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } },
  };

  const selectedNote = notes.find((n) => n._id === selectedNoteId);

  const handleCreate = async () => {
    setClientError(null);
    setCreating(true);
    const id = crypto.randomUUID();
    const newDraft: NoteTypes = {
      id,
      _id: id,
      title: "Untitled Note",
      content: "",
      tags: [],
      isArchived: false,
      lastEdited: new Date().toISOString(),
      isDummy: !token,
    };
    setDraftNote(newDraft);
    dispatch(setSelectedNote(newDraft._id));
    dispatch(setView("noteDetail"));
    setCreating(false);
  };
  const handleSave = async () => {
    setClientError(null);
    if (!draftNote) return;
    const title = (draftNote.title || "").trim();
    const content = (draftNote.content || "").trim();
    const tags = draftNote.tags.map((t) => t.trim()).filter(Boolean);
    if (!title || title === "Untitled Note") {
      setClientError("Title cannot be empty");
      return;
    }
    if (!content) {
      setClientError("Content cannot be empty");
      return;
    }
    if (tags.length === 0) {
      setClientError("You must add at least one tag");
      return;
    }
    setSaving(true);
    const updated: NoteTypes = {
      ...draftNote,
      title,
      content,
      tags,
      lastEdited: new Date().toISOString(),
    };
    try {
      if (token) {
        const created = await dispatch(
          addNote(updated as Partial<NoteTypes>)
        ).unwrap();
        dispatch(setSelectedNote(created._id));
      } else {
        dispatch(addGuestNote(updated));
        dispatch(setSelectedNote(updated._id));
      }
      setDraftNote(null);
    } catch (err) {
      setClientError(typeof err === "string" ? err : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = async () => {
    if (!draftNote) return;
    const isPersisted = notes.some((n) => n._id === draftNote._id);
    if (isPersisted) {
      if (!token) dispatch(deleteGuestNote(draftNote._id));
      else {
        try {
          await dispatch(deleteNote(draftNote._id)).unwrap();
        } catch {
          setClientError("could not cancel at this time");
          return;
        }
      }
    }
    setDraftNote(null);
    dispatch(setSelectedNote(null));
    setClientError(null);
  };

  const confirmArchive = async () => {
    if (!selectedNote) return;
    setArchiving(true);
    const updated: NoteTypes = {
      ...selectedNote,
      isArchived: !selectedNote.isArchived,
      lastEdited: new Date().toISOString(),
    };
    try {
      if (token) await dispatch(updateNote(updated)).unwrap();
      else dispatch(updateGuestNote(updated));
      setArchiveModal(false);
    } catch (err) {
      setClientError(typeof err === "string" ? err : "Failed to archive note");
    } finally {
      setArchiving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedNote) return;
    setDeleting(true);
    try {
      if (token) await dispatch(deleteNote(selectedNote._id)).unwrap();
      else dispatch(deleteGuestNote(selectedNote._id));
      setDeleteModal(false);
      dispatch(setSelectedNote(null));
    } catch (err) {
      setClientError(typeof err === "string" ? err : "Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };
  const handleGoBack = () => {
    dispatch(clearSelection());
    dispatch(setView("search"));
  };
  const handleGoBackTag = () => {
    dispatch(setView("tags"));
    dispatch(clearSelection());
    dispatch(setFilter("all"));
    dispatch(setSearchQuery(""));
  };
  return (
    <div className="notesContainer">
      {view !== "search" && view !== "noteDetail" && view !== "tags" && (
        <section className="noteLists">
          {!isTablet ? (
            <button
              aria-label="create"
              className="createNote"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <motion.div
                  className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full dark:border-gray-600"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                />
              ) : (
                "+ Create New Note"
              )}
            </button>
          ) : (
            <motion.h1
              key={
                showSettings
                  ? "setting"
                  : searchQuery
                  ? `search-${searchQuery}`
                  : `filter-${JSON.stringify(filter)}`
              }
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {showSettings ? (
                "Setting"
              ) : searchQuery && searchQuery.trim() ? (
                <>
                  Showing results for: <strong>{searchQuery}</strong>
                </>
              ) : filter === "all" ? (
                "All Notes"
              ) : filter === "archived" ? (
                "Archived Notes"
              ) : (
                <div className="notelistTop">
                  <button
                    className="goBackBtn"
                    onClick={handleGoBackTag}
                    aria-label="go back"
                  >
                    <img src="/assets/images/icon-arrow-left.svg" alt="back" />
                    <p>Go Back</p>
                  </button>
                  <div>
                    <span> Notes Tagged:</span>{" "}
                    {typeof filter === "object" ? filter.tag : ""}
                  </div>
                </div>
              )}
            </motion.h1>
          )}
          <motion.ul
            className="notesList"
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            layout
          >
            <AnimatePresence>
              {[...notes]
                .sort((a, b) => {
                  if (a.title === "Untitled Note") return -1;
                  if (b.title === "Untitled Note") return 1;
                  return (
                    new Date(b.lastEdited).getTime() -
                    new Date(a.lastEdited).getTime()
                  );
                })
                .map((note) => (
                  <motion.li
                    key={note._id}
                    variants={item}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    layoutId={`note-${note._id}`}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.985 }}
                    onClick={() => {
                      const untitled = notes.find(
                        (n) => n.title === "Untitled Note"
                      );
                      if (untitled && selectedNoteId === untitled._id) {
                        if (token) dispatch(deleteNote(untitled._id));
                        else dispatch(deleteGuestNote(untitled._id));
                      }
                      dispatch(setSelectedNote(note._id));
                      dispatch(setView("noteDetail"));
                      dispatch(closeSearch());
                      setDraftNote(null);
                      setClientError(null);
                    }}
                    className={selectedNoteId === note._id ? "active" : ""}
                  >
                    <h3>{note.title}</h3>
                    {note.title !== "Untitled Note" && (
                      <div className="meta">
                        <div className="tagsList">
                          {note.tags.map((tag, i) => (
                            <p key={i}>{tag}</p>
                          ))}
                        </div>
                        <small>
                          {new Date(note.lastEdited).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </small>
                      </div>
                    )}
                  </motion.li>
                ))}
            </AnimatePresence>
          </motion.ul>
        </section>
      )}
      {view !== "search" && view !== "noteDetail" && !isTablet && (
        <section className="noteInfo">
          <AnimatePresence mode="wait">
            {draftNote ? (
              <motion.div
                className="information"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="headerNote">
                  <input
                    type="text"
                    placeholder="Enter a title…"
                    value={
                      draftNote.title === "Untitled Note" ? "" : draftNote.title
                    }
                    onChange={(e) =>
                      setDraftNote({
                        ...draftNote,
                        title: e.target.value || "Untitled Note",
                      })
                    }
                    className="titleInput"
                  />
                  <section>
                    <div>
                      <h5>
                        <img src="/assets/images/icon-tag.svg" alt="tag" />
                        <p>Tags</p>
                      </h5>
                      <input
                        type="text"
                        placeholder="Add tags separated by commas"
                        value={draftNote.tags.join(", ")}
                        onChange={(e) =>
                          setDraftNote({
                            ...draftNote,
                            tags: e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          })
                        }
                        className="tagsInput"
                      />
                    </div>
                    <div>
                      <h5>
                        <img src="/assets/images/icon-clock.svg" alt="clock" />
                        <p>Last edited</p>
                      </h5>
                      <input placeholder="Not yet saved" readOnly />
                    </div>
                  </section>
                </div>

                <textarea
                  placeholder="Start writing your note..."
                  value={draftNote.content}
                  onChange={(e) =>
                    setDraftNote({ ...draftNote, content: e.target.value })
                  }
                  className="contentInput"
                />

                <div className="btnsContainer">
                  <button
                    onClick={handleSave}
                    className="saveBtn"
                    disabled={saving}
                    aria-busy={saving}
                  >
                    {saving ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full dark:border-gray-600"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      "Save Note"
                    )}
                  </button>
                  <button onClick={handleCancel} className="cancelBtn">
                    Cancel
                  </button>
                </div>

                {clientError && <p className="error">{clientError}</p>}
              </motion.div>
            ) : (
              selectedNote && (
                <motion.div
                  key={selectedNote._id}
                  className="information"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="headerNote">
                    <h1>{selectedNote.title}</h1>
                    <section>
                      <div>
                        <h5>
                          <img src="/assets/images/icon-tag.svg" alt="tag" />
                          <p>Tags</p>
                        </h5>
                        <div>
                          {selectedNote.tags.map((tag, i) => (
                            <h5 key={i}>{tag}</h5>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5>
                          <img
                            src="/assets/images/icon-clock.svg"
                            alt="clock"
                          />
                          <p>Last edited</p>
                        </h5>
                        <p>
                          {new Date(selectedNote.lastEdited).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </section>
                  </div>
                  <div
                    className="noteContent"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {selectedNote.content}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </section>
      )}
      {selectedNote && !isTablet && (
        <section className="archiveOrDelete">
          {selectedNote && !draftNote && (
            <div>
              <button
                aria-label="btnarchive"
                onClick={() => setArchiveModal(true)}
              >
                <img src={"/assets/images/icon-archive.svg"} />
                <p>
                  {selectedNote.isArchived ? "Unarchive Note" : "Archive Note"}
                </p>
              </button>
              <button
                aria-label="btndelete"
                onClick={() => setDeleteModal(true)}
              >
                <img src={"/assets/images/icon-delete.svg"} />
                <p>Delete Note</p>
              </button>
            </div>
          )}
        </section>
      )}
      {selectedNote && deleteModal && (
        <div className="modalOverlay">
          <section ref={deleteRef} className="deleteModal">
            <div>
              <img src="/assets/images/icon-delete.svg" alt="delete" />
              <div>
                <h3>Delete Note</h3>
                <p>
                  Are you sure you want to permanently delete this note? This
                  action cannot be undone.
                </p>
              </div>
            </div>
            <div className="btnContainer">
              <button
                className="cancel"
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void confirmDelete();
                }}
                disabled={deleting}
                className="delete"
              >
                {deleting ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full dark:border-gray-600"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                  />
                ) : (
                  "Delete Note"
                )}
              </button>
            </div>
          </section>
        </div>
      )}
      {selectedNote && archiveModal && (
        <div className="modalOverlay">
          <section ref={archiveRef} className="archiveModal">
            <div>
              <img src="/assets/images/icon-archive.svg" alt="archive" />
              <div>
                <h3>Archive Note</h3>
                <p>
                  Are you sure you want to archive this note? You can find it in
                  the Archived Notes section and restore it anytime.
                </p>
              </div>
            </div>
            <div className="btnContainer">
              <button
                className="cancel"
                onClick={() => setArchiveModal(false)}
                disabled={archiving}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void confirmArchive();
                }}
                disabled={archiving}
              >
                {archiving ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full dark:border-gray-600"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                  />
                ) : (
                  "Archive Note"
                )}
              </button>
            </div>
          </section>
        </div>
      )}
      {isTablet && view === "search" && (
        <Search
          onSelect={(note) => {
            dispatch(setSelectedNote(note._id));
            dispatch(setView("noteDetail"));
            dispatch(closeSearch());
          }}
        />
      )}
      {isTablet && view === "noteDetail" && selectedNote && (
        <section className="noteInfo tablet">
          <motion.div
            key={selectedNote._id}
            className="topNoteSec"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="goBackBtn">
              <button aria-label="go back btn" onClick={handleGoBack}>
                <img src="/assets/images/icon-arrow-left.svg" alt="arrow" />
                <p>Go Back</p>
              </button>
            </div>
            <div className="navBtnsIn">
              <div>
                <button
                  aria-label="delete tablet "
                  onClick={() => setDeleteModal(true)}
                >
                  <img src="/assets/images/icon-delete.svg" alt="delete" />
                </button>
              </div>
              <div>
                <button
                  aria-label="archive label"
                  onClick={() => setArchiveModal(true)}
                >
                  {selectedNote.isArchived ? (
                    <img src="/assets/images/icon-restore.svg" alt="archive" />
                  ) : (
                    <img src="/assets/images/icon-archive.svg" alt="archive" />
                  )}
                </button>
              </div>
              <div className="cancelNote">
                <button aria-label="cancel tablet">Cancel</button>
              </div>
              <div className="saveNote">
                <button aria-label="save tablet">Save Note</button>
              </div>
            </div>
          </motion.div>{" "}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNote._id}
              className="information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="headerNote">
                <h1>{selectedNote.title}</h1>
                <section>
                  <div>
                    <h5>
                      <img src="/assets/images/icon-tag.svg" alt="tag" />
                      <p>Tags</p>
                    </h5>
                    <div>
                      {selectedNote.tags.map((tag, i) => (
                        <h5 key={i}>{tag}</h5>
                      ))}
                    </div>
                  </div>
                  {isTablet && (
                    <div>
                      <h5>
                        <img src="/assets/images/icon-status.svg" alt="tag" />
                        <p>Status</p>
                      </h5>
                      <div>Archived</div>
                    </div>
                  )}
                  <div>
                    <h5>
                      <img src="/assets/images/icon-clock.svg" alt="clock" />
                      <p>Last edited</p>
                    </h5>
                    <p>
                      {new Date(selectedNote.lastEdited).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </section>
              </div>
              <div className="noteContent" style={{ whiteSpace: "pre-line" }}>
                {selectedNote.content}
              </div>{" "}
              <section className="archiveOrDelete">
                {selectedNote && !draftNote && (
                  <div>
                    <button
                      aria-label="btnarchive"
                      onClick={() => setArchiveModal(true)}
                    >
                      <img src={"/assets/images/icon-archive.svg"} />
                      <p>
                        {selectedNote.isArchived
                          ? "Unarchive Note"
                          : "Archive Note"}
                      </p>
                    </button>
                    <button
                      aria-label="btndelete"
                      onClick={() => setDeleteModal(true)}
                    >
                      <img src={"/assets/images/icon-delete.svg"} />
                      <p>Delete Note</p>
                    </button>
                  </div>
                )}
              </section>
            </motion.div>
          </AnimatePresence>
        </section>
      )}
      {isTablet && view === "tags" && <Nav />}
      {isTablet && <Footer />}
    </div>
  );
};

export default Notes;
