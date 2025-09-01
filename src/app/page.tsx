"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  selectNotesState,
  setSearchQuery,
  toggleSettings,
} from "./redux/noteSlice";
import Nav from "./components/Nav";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
  fetchNotes,
  loadGuestNotes,
  addGuestNote,
  fetchGuestNotes,
} from "./redux/noteSlice";
import Header from "./components/Header";
import Setting from "./components/Setting";
import Notes from "./components/Notes";
import { useWindowSize } from "./components/useWindowSize";
import Footer from "./components/Footer";
export default function Home() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const { filter, searchQuery, showSettings, isRefetching, loading } =
    useAppSelector(selectNotesState);
  const notes = useAppSelector((s) => s.notes.notes);
  const { isTablet } = useWindowSize();

  useEffect(() => {
    if (token) {
      dispatch(fetchNotes());
    } else {
      dispatch(fetchGuestNotes());
    }
  }, [token, dispatch]);
  // const add = () => {
  //   const newNote = {
  //     id: (globalThis.crypto?.randomUUID?.() ?? nanoid()),
  //     title: "New note",
  //     tags: [],
  //     content: "",
  //     lastEdited: new Date().toISOString(),
  //     isArchived: false,
  //     isDummy: !token,
  //   };
  //   if (token) {
  //     // call thunk that posts to API (addNote)
  //     dispatch<any>(/* addNote(newNote) */); // replace with your addNote thunk
  //   } else {
  //     dispatch(addGuestNote(newNote));
  //   }
  // };
  return (
    <AnimatePresence>
      {isRefetching && (
        <motion.div
          key="refetchLoader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 px-3 py-2 bg-blue-500 text-white rounded-lg shadow-md"
        >
          🔄 Refreshing notes...
        </motion.div>
      )}
      <div className="appContainer">
        {!isTablet && <Nav />}{" "}
        <main className="flex  items-center">
          {/* <button onClick={add}>Add Note</button> */}
          <Header />
          {showSettings ? (
            <motion.div
              key="settingsPanel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="settingsPanel"
            >
              <Setting />
            </motion.div>
          ) : (
            <Notes />
          )}
        </main>
      </div>
    </AnimatePresence>
  );
}
