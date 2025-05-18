'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { X } from 'lucide-react';

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ isOpen, onClose, title, children, size = "3xl" }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
      className="bg-[#161A1E] text-white border border-gray-700 rounded-xl shadow-xl"
      classNames={{
        backdrop: "bg-black/70 backdrop-blur-sm",
        base: "max-h-[90vh] bg-[#161A1E] text-white border border-gray-700",
        header: "border-b border-gray-600 text-lg font-semibold",
        body: "py-4 px-6",
        footer: "border-t border-gray-600",
        closeButton: "hidden" // We use a custom close button
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          {title}
          <Button isIconOnly variant="light" onPress={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </Button>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
        {/* Optional Footer can be added if needed later */}
        {/* <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default MetricDetailModal;