import React from "react";
import {
  motion,
  AnimatePresence,
  Variants,
  useReducedMotion,
} from "framer-motion";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectNotesState, setSearchQuery } from "../redux/noteSlice";
import { NoteTypes } from "../utils/types";
import { useWindowSize } from "./useWindowSize";
import { selectVisibleNotes } from "../redux/noteSlice";

type SearchProps = {
  onSelect?: (note: NoteTypes) => void;
};

const Search: React.FC<SearchProps> = ({ onSelect }) => {
  const dispatch = useAppDispatch();
  const { searchQuery } = useAppSelector(selectNotesState);
  const { isTablet } = useWindowSize();
  const notes = useAppSelector(selectVisibleNotes);
  const prefersReducedMotion = useReducedMotion();

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <>
      {isTablet ? (
        <div className="tabletSearchPanel">
          <h1>Search</h1>
          <div className="search">
            <img src={`/assets/images/icon-search.svg`} alt="search icon" />
            <input
              type="text"
              placeholder="Search by title, content, or tags… "
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {searchQuery && (
            <motion.ul
              className="noteLists"
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
                      onClick={() => onSelect?.(note)}
                      style={{ cursor: "pointer" }}
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
          )}
        </div>
      ) : (
        <div className="search">
          <img src={`/assets/images/icon-search.svg`} alt="search icon" />
          <input
            type="text"
            placeholder="Search by title, content, or tags… "
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      )}
    </>
  );
};

export default Search;
