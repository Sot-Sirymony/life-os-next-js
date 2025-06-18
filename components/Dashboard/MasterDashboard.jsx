import React, { useState, useEffect } from "react";
import { FaBullseye, FaLayerGroup, FaCalendarAlt, FaChartBar, FaBars, FaTimes, FaUserCircle, FaPlus } from "react-icons/fa";

const navItems = [
  { label: "Life Goals", icon: <FaBullseye /> },
  { label: "Goal Categories", icon: <FaLayerGroup /> },
  { label: "Weekly Planner", icon: <FaCalendarAlt /> },
  { label: "Progress Summary", icon: <FaChartBar /> },
];

const widgetData = [
  { title: "Total Goals", value: 0 },
  { title: "Tasks Done", value: 0 },
  { title: "AI-Optimized Tasks", value: 0 },
];

export default function MasterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [activeSection, setActiveSection] = useState(navItems[0].label);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 900) {
        setIsDesktop(true);
        setSidebarOpen(true);
      } else {
        setIsDesktop(false);
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive styles
  const sidebarStyle = {
    position: "fixed",
    top: 0,
    left: sidebarOpen || isDesktop ? 0 : -260,
    width: 220,
    height: "100vh",
    background: "#6495ED",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: windowWidth < 600 ? "1.2rem 0.5rem 1rem 1rem" : "2rem 1rem 1rem 1.5rem",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    boxShadow: "2px 0 8px rgba(100,149,237,0.08)",
    zIndex: 1001,
    transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.2)",
    zIndex: 1000,
    display: sidebarOpen && !isDesktop ? "block" : "none",
  };

  const mainStyle = {
    flex: 1,
    padding: isDesktop ? "2rem 2rem 2rem 2.5rem" : windowWidth < 600 ? "1rem 0.5rem" : "1.5rem 1rem",
    marginLeft: isDesktop ? 220 : 0,
    transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
    width: "100%",
    minHeight: "100vh",
  };

  const widgetsStyle = {
    display: "flex",
    flexDirection: windowWidth < 700 ? "column" : "row",
    gap: windowWidth < 700 ? 16 : 24,
    marginBottom: windowWidth < 700 ? 16 : "2rem",
    alignItems: windowWidth < 700 ? "stretch" : "center",
  };

  const widgetBoxStyle = {
    background: "#D8BFD8",
    color: "#333",
    borderRadius: 12,
    padding: windowWidth < 700 ? "1rem 1rem" : "1.5rem 2rem",
    minWidth: 0,
    boxShadow: "0 2px 8px rgba(100,149,237,0.08)",
    fontFamily: "'Poppins', sans-serif",
    flex: windowWidth < 700 ? "unset" : 1,
    textAlign: windowWidth < 700 ? "center" : "left",
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.2s",
  };

  const widgetBoxHoverStyle = {
    boxShadow: "0 4px 16px rgba(100,149,237,0.18)",
    transform: "translateY(-2px) scale(1.03)",
  };

  const sectionsStyle = {
    display: "grid",
    gridTemplateColumns: windowWidth < 900 ? "1fr" : "1fr 1fr",
    gap: windowWidth < 700 ? 16 : 32,
  };

  const sectionBoxStyle = {
    background: "white",
    borderRadius: 12,
    padding: windowWidth < 700 ? 16 : 24,
    minHeight: 120,
    boxShadow: "0 2px 8px rgba(100,149,237,0.08)",
    marginBottom: windowWidth < 700 ? 8 : 0,
  };

  // Floating Action Button (FAB)
  const fabStyle = {
    position: "fixed",
    right: windowWidth < 600 ? 18 : 32,
    bottom: windowWidth < 600 ? 18 : 32,
    background: "#6495ED",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: windowWidth < 600 ? 48 : 60,
    height: windowWidth < 600 ? 48 : 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: windowWidth < 600 ? 22 : 28,
    boxShadow: "0 4px 16px rgba(100,149,237,0.18)",
    cursor: "pointer",
    zIndex: 2000,
    transition: "background 0.2s, box-shadow 0.2s",
  };

  // Widget hover state
  const [hoveredWidget, setHoveredWidget] = useState(null);

  return (
    <div style={{ display: "flex", background: "#E6F0FF", minHeight: "100vh", fontFamily: "'PT Sans', sans-serif" }}>
      {/* Overlay for mobile */}
      <div style={overlayStyle} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* User Profile Section */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: windowWidth < 600 ? 18 : 32, width: "100%" }}>
          <FaUserCircle style={{ fontSize: windowWidth < 600 ? 28 : 36, marginRight: 10 }} />
          <span style={{ fontSize: windowWidth < 600 ? 15 : 18, fontWeight: 500 }}>Hi, Alex</span>
        </div>
        {/* Close button for mobile */}
        {!isDesktop && (
          <span style={{ position: "absolute", top: 18, right: 18, cursor: "pointer", fontSize: 22 }} onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </span>
        )}
        {navItems.map((item) => (
          <span
            key={item.label}
            onClick={() => setActiveSection(item.label)}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: windowWidth < 600 ? 18 : 28,
              cursor: "pointer",
              fontSize: windowWidth < 600 ? 15 : 18,
              width: "100%",
              background: activeSection === item.label ? "rgba(255,255,255,0.13)" : "none",
              borderRadius: 8,
              padding: "6px 10px",
              transition: "background 0.2s",
            }}
          >
            <span style={{ marginRight: windowWidth < 600 ? 10 : 14, fontSize: windowWidth < 600 ? 18 : 22 }}>{item.icon}</span>
            {item.label}
          </span>
        ))}
      </aside>

      {/* Main Content */}
      <main style={mainStyle}>
        {/* Burger button for all screens */}
        {(!sidebarOpen || !isDesktop) && (
          <span
            style={{ fontSize: windowWidth < 600 ? 22 : 28, cursor: "pointer", marginBottom: 24, display: "inline-block" }}
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </span>
        )}
        {/* Dashboard Widgets */}
        <div style={widgetsStyle}>
          {widgetData.map((widget, idx) => (
            <div
              key={widget.title}
              style={{
                ...widgetBoxStyle,
                ...(hoveredWidget === idx ? widgetBoxHoverStyle : {}),
              }}
              onMouseEnter={() => setHoveredWidget(idx)}
              onMouseLeave={() => setHoveredWidget(null)}
              onClick={() => alert(`Clicked on ${widget.title}`)}
            >
              <div style={{ fontSize: windowWidth < 600 ? 15 : 18, marginBottom: 8 }}>{widget.title}</div>
              <div style={{ fontSize: windowWidth < 600 ? 22 : 32, fontWeight: 700 }}>{widget.value}</div>
            </div>
          ))}
        </div>

        {/* Placeholder Sections */}
        <div style={sectionsStyle}>
          <div style={sectionBoxStyle}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#6495ED", fontSize: windowWidth < 600 ? 17 : 22 }}>Life Goals</h2>
            <p style={{ fontSize: windowWidth < 600 ? 13 : 16 }}>Quick access and summary of your life goals.</p>
          </div>
          <div style={sectionBoxStyle}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#6495ED", fontSize: windowWidth < 600 ? 17 : 22 }}>Goal Categories</h2>
            <p style={{ fontSize: windowWidth < 600 ? 13 : 16 }}>Overview of your goal categories.</p>
          </div>
          <div style={sectionBoxStyle}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#6495ED", fontSize: windowWidth < 600 ? 17 : 22 }}>Weekly Planner</h2>
            <p style={{ fontSize: windowWidth < 600 ? 13 : 16 }}>Plan your week and assign tasks.</p>
          </div>
          <div style={sectionBoxStyle}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", color: "#6495ED", fontSize: windowWidth < 600 ? 17 : 22 }}>Progress Summary</h2>
            <p style={{ fontSize: windowWidth < 600 ? 13 : 16 }}>Track your progress and completed tasks.</p>
          </div>
        </div>
        {/* Floating Action Button */}
        <button style={fabStyle} onClick={() => alert("Add Goal action!")} title="Add Goal">
          <FaPlus />
        </button>
      </main>
    </div>
  );
} 