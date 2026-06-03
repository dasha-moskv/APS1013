import pandas as pd
import matplotlib.pyplot as plt
import os
import numpy as np

def main():
    # 1. Read CSV
    file_path = 'supplier-list.csv'
    if not os.path.exists(file_path):
        # Fallback absolute path
        file_path = '/Users/epheriami/Downloads/Projects/aps1013/project/scripts/supplier-list.csv'

    print(f"Reading data from: {file_path}")
    df = pd.read_csv(file_path)

    # 2. Drop nulls and empty rows
    # Drop rows that are fully empty or have nulls in Country
    initial_len = len(df)
    df = df.dropna(how='all')
    df = df.dropna(subset=['Country'])
    df = df[df['Country'].astype(str).str.strip() != '']
    cleaned_len = len(df)
    
    print(f"Loaded {initial_len} rows. Cleaned down to {cleaned_len} valid rows (dropped {initial_len - cleaned_len} null/empty rows).")

    # Get counts and sort ascending for the horizontal bar chart
    country_counts = df['Country'].value_counts().sort_values(ascending=True)

    # 3. Create a beautiful, premium visualization
    # Set a clean, modern aesthetic
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(11, 7), dpi=300)

    # Create a stunning gradient color palette (Teal to Deep Indigo/Purple)
    # We use a custom colormap gradient that looks premium
    num_countries = len(country_counts)
    colors = plt.cm.viridis(np.linspace(0.3, 0.85, num_countries))

    # Create horizontal bar chart
    bars = ax.barh(country_counts.index, country_counts.values, color=colors, edgecolor='none', height=0.65)

    # Adjust axes and grid aesthetics
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#cccccc')
    ax.spines['bottom'].set_color('#cccccc')
    ax.xaxis.grid(True, linestyle='--', alpha=0.5, color='#d0d0d0')
    ax.yaxis.grid(False) # Turn off horizontal grid lines to keep it clean

    # Add count labels at the end of each bar
    max_val = max(country_counts.values)
    for bar in bars:
        width = bar.get_width()
        # Position labels slightly outside the bar, or inside if too long
        label_x = width + (max_val * 0.01)
        ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{int(width)}',
                va='center', ha='left', fontsize=10, fontweight='bold', color='#2c3e50')

    # Titles and labels with clean elegant typography
    ax.set_title('Global Distribution of Aerospace Suppliers by Country', fontsize=16, fontweight='bold', pad=22, color='#1a252f')
    ax.set_xlabel('Number of Suppliers', fontsize=12, labelpad=12, color='#34495e')
    ax.set_ylabel('Country', fontsize=12, labelpad=12, color='#34495e')

    # Highlight tick labels
    ax.tick_params(axis='both', which='major', labelsize=10, colors='#2c3e50')

    # Set x-limit with some padding for text labels
    ax.set_xlim(0, max_val + (max_val * 0.08))

    # Add a subtle source watermark in the bottom right
    ax.text(0.98, -0.09, 'Source: supplier-list.csv | Visualized via Antigravity AI', 
            transform=ax.transAxes, fontsize=8.5, color='#95a5a6', ha='right', style='italic')

    plt.tight_layout()

    # Save the visualization
    output_path = 'supplier_histogram.png'
    plt.savefig(output_path, bbox_inches='tight', dpi=300)
    print(f"Successfully generated and saved histogram to {os.path.abspath(output_path)}")

    # Print out the tabular results sorted descending for the user
    print("\n" + "="*45)
    print(f"{'Country':<25} | {'Supplier Count':<15}")
    print("="*45)
    for country, count in country_counts.iloc[::-1].items():
        print(f"{country:<25} | {count:<15}")
    print("="*45)

if __name__ == '__main__':
    main()
