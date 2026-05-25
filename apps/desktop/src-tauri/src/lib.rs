/// Entry point for the Tauri desktop application.
/// The frontend is served from the Nuxt build output configured in tauri.conf.json.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
