import mesop as me
import mesop.components.text as text
import mesop.components.box as box
import random

# PiWorker-OS Venture Lab Dashboard
# Style: Quantum Cyberpunk
# Logic: Real-time telemetry visualization for the Profit Vortex

@me.state
class State:
    total_profit: float = 1250.75
    active_agents: int = 5
    budget_cannibalized: float = 45.2
    is_vortex_stable: bool = True

def load_telemetry():
    state = me.state(State)
    # Simulation: In production, this would query PocketBase or the Neural Mesh
    state.total_profit += random.uniform(-0.5, 2.0)
    state.budget_cannibalized += random.uniform(0.1, 0.5)

@me.page(path="/dashboard")
def dashboard():
    load_telemetry()
    state = me.state(State)
    
    with box.box(style=me.Style(
        background="#080808",
        height="100vh",
        padding=me.Padding.all(24),
        font_family="Inter, sans-serif"
    )):
        # Header
        with box.box(style=me.Style(display="flex", justify_content="space-between", margin=me.Margin(bottom=40))):
            me.text("VENTURE LAB // PROFIT VORTEX", type=me.Typography.H4, style=me.Style(color="#39FF14", font_weight="bold", letter_spacing="2px"))
            me.text("STATUS: SOVEREIGN", style=me.Style(color="#008080", font_size="12px", border="1px solid #008080", padding=me.Padding.all(4)))

        # Stats Grid
        with box.box(style=me.Style(display="grid", grid_template_columns="repeat(3, 1fr)", gap=20)):
            stat_card("TOTAL PROFIT", f"${state.total_profit:.2f} π", "#39FF14")
            stat_card("ACTIVE AGENTS", str(state.active_agents), "#ffffff")
            stat_card("CANNIBALIZED BUDGET", f"${state.budget_cannibalized:.2f}", "#ff4444")

        # Visualizer Placeholder
        with box.box(style=me.Style(
            margin=me.Margin(top=40),
            height="300px",
            background="rgba(57, 255, 20, 0.03)",
            border="1px dashed rgba(57, 255, 20, 0.2)",
            display="flex",
            align_items="center",
            justify_content="center"
        )):
            me.text("QUANTUM MIRROR STREAM ACTIVE", style=me.Style(color="rgba(57, 255, 20, 0.5)", font_size="14px"))

def stat_card(label: str, value: str, color: str):
    with box.box(style=me.Style(
        background="rgba(255, 255, 255, 0.05)",
        padding=me.Padding.all(20),
        border_radius=12,
        border="1px solid rgba(255, 255, 255, 0.1)"
    )):
        me.text(label, style=me.Style(color="#888", font_size="12px", margin=me.Margin(bottom=8)))
        me.text(value, type=me.Typography.H2, style=me.Style(color=color, font_weight="bold"))

@me.page(path="/")
def home():
    me.text("PiWorker-OS Entry Point. Navigate to /dashboard for telemetry.")
